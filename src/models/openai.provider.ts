import type { ChatCompletionTool } from 'openai/resources'
import type { LLMProvider } from './llm.interface'
import OpenAI from 'openai'
import { config } from '../config/env'
import { findTool, getToolDefinitions } from '../tools/tool.registry'

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openaiApiKey,
      baseURL: config.openaiBaseURL,
    })
  }

  async stream(messages: any[], onChunk: (text: string) => void) {
    let currentMessages = [...messages]

    // 简单串行工具调用链：模型可多次调用工具，但每次等一轮执行完再继续
    while (true) {
      const stream
        = await this.client.chat.completions.create({
          model: config.openaiModel,
          messages: currentMessages,
          stream: true,
          tools: getToolDefinitions() as ChatCompletionTool[],
          tool_choice: 'auto',
        })

      const toolCallBuffers: Record<string, {
        id?: string
        type?: string
        function: {
          name: string
          arguments: string
        }
      }> = {}

      let hasToolCalls = false
      let finishReason: string | null = null

      for await (const chunk of stream) {
        const choice = chunk.choices[0]
        if (!choice)
          continue

        const delta = choice.delta

        if (delta?.content) {
          onChunk(delta.content)
        }

        if (delta?.tool_calls && delta.tool_calls.length > 0) {
          hasToolCalls = true

          for (const toolCallDelta of delta.tool_calls) {
            const key = toolCallDelta.id ?? String(toolCallDelta.index ?? 0)
            const buffer = toolCallBuffers[key] || {
              id: toolCallDelta.id,
              type: toolCallDelta.type,
              function: {
                name: '',
                arguments: '',
              },
            }

            if (toolCallDelta.function?.name)
              buffer.function.name = toolCallDelta.function.name

            if (toolCallDelta.function?.arguments)
              buffer.function.arguments += toolCallDelta.function.arguments

            toolCallBuffers[key] = buffer
          }
        }

        if (choice.finish_reason)
          finishReason = choice.finish_reason
      }

      // 没有工具调用，或模型已输出最终回答，结束循环
      if (!hasToolCalls || finishReason !== 'tool_calls')
        break

      const completedToolCalls = Object.values(toolCallBuffers)

      // 先把带 tool_calls 的 assistant 消息加入对话
      currentMessages = [
        ...currentMessages,
        {
          role: 'assistant',
          tool_calls: completedToolCalls.map((tc, index) => ({
            id: tc.id ?? `tool_call_${index}`,
            type: tc.type ?? 'function',
            function: {
              name: tc.function.name,
              arguments: tc.function.arguments,
            },
          })),
        },
      ]

      // 执行每个工具，并把结果作为 tool 消息加入对话
      for (const tc of completedToolCalls) {
        const toolName = tc.function.name
        const tool = findTool(toolName)

        let result = ''

        if (!tool) {
          result = `未知工具: ${toolName}`
        }
        else {
          try {
            const args = tc.function.arguments
              ? JSON.parse(tc.function.arguments)
              : {}
            result = await tool.execute(args)
          }
          catch (error: any) {
            console.error('Tool execute error:', error)
            const message = error?.message || String(error)
            result = `工具执行失败: ${message}`
          }
        }

        currentMessages.push({
          role: 'tool',
          name: toolName,
          content: result,
        })
      }

      // 继续下一轮循环，让模型基于 tool 结果生成最终回答
    }
  }

  async chat(messages: any[]) {
    const res = await this.client.chat.completions.create({
      model: config.openaiModel,
      messages,
    })

    const content = res.choices[0]?.message?.content ?? ''
    return content
  }
}
