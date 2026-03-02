import type { LLMProvider, StreamChunk } from '../models/llm.interface'
import type { AgentEvent, CompletedToolCall } from './agent.types'
import { executeTool } from './agent.executor'
import { parseOpenAIDelta } from './agent.parser'
import { ToolCallAssembler } from './tool-call.assembler'

const MAX_TOOL_ROUNDS = 5

export type GetToolDefinitions = () => any[]

type StepResult
  = | { type: 'text', content: string }
    | { type: 'tool', toolCalls: CompletedToolCall[] }

async function runOneStep(
  provider: LLMProvider,
  currentMessages: any[],
  getToolDefinitions: GetToolDefinitions,
  onEvent: (data: AgentEvent) => void,
): Promise<StepResult> {
  const tools = getToolDefinitions()
  const stream = provider.streamRaw(currentMessages, {
    tools,
    tool_choice: 'auto',
  })

  const toolAssembler = new ToolCallAssembler()
  let finishReason: string | null = null
  let assistantContent = ''
  for await (const chunk of stream) {
    const events = parseOpenAIDelta(chunk as StreamChunk)

    for (const event of events) {
      switch (event.type) {
        case 'content':
          assistantContent += event.text
          onEvent({
            type: 'text',
            content: event.text, // 纯流式输出
          })
          break

        case 'tool_call_delta': {
          toolAssembler.process(event)
          break
        }

        case 'finish':
          finishReason = event.reason
          break
      }
    }
  }

  if (finishReason === 'tool_calls' && toolAssembler.hasToolCalls()) {
    const completedToolCalls = toolAssembler.getCompleted()
    // 在这里发完整 tool_call 事件
    for (const tc of completedToolCalls) {
      onEvent({
        type: 'tool_call',
        name: tc.function.name,
        args: tc.function.arguments,
      })
    }
    return {
      type: 'tool',
      toolCalls: completedToolCalls,
    }
  }

  return {
    type: 'text',
    content: assistantContent,
  }
}

export async function runLoop(
  provider: LLMProvider,
  messages: any[],
  getToolDefinitions: GetToolDefinitions,
  onEvent: (data: AgentEvent) => void,
): Promise<void> {
  const currentMessages = [...messages]
  let round = 0

  while (round < MAX_TOOL_ROUNDS) {
    round++
    const stepResult = await runOneStep(provider, currentMessages, getToolDefinitions, onEvent)
    // 🟢 情况 1：模型给出最终答案
    if (stepResult.type === 'text') {
      if (stepResult.content) {
        currentMessages.push({
          role: 'assistant',
          content: stepResult.content,
        })
      }
      break
    }
    // 🔵 情况 2：模型请求调用工具
    if (stepResult.type === 'tool') {
      const completedToolCalls = stepResult.toolCalls

      // 先把 assistant 的 tool_calls 记录进消息
      currentMessages.push({
        role: 'assistant',
        tool_calls: completedToolCalls.map((tc, i) => ({
          id: tc.id ?? `tool_call_${i}`,
          type: tc.type ?? 'function',
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments,
          },
        })),
      })

      // 执行所有工具
      for (let i = 0; i < completedToolCalls.length; i++) {
        const tc = completedToolCalls[i]
        const toolCallId = tc.id ?? `tool_call_${i}`

        const result = await executeTool(
          tc.function.name,
          tc.function.arguments,
        )
        onEvent({
          type: 'tool_result',
          content: result,
        })
        currentMessages.push({
          role: 'tool',
          tool_call_id: toolCallId,
          content: result,
        })
      }

      // 继续下一轮
      continue
    }
  }

  // 🔴 情况 3：达到最大轮数，但模型还在思考
  if (round >= MAX_TOOL_ROUNDS) {
    const stream = provider.streamRaw(currentMessages, {
      tools: [], // 🚨 禁止再调用工具
      tool_choice: 'none',
    })

    let finalContent = ''

    for await (const chunk of stream) {
      const c = chunk as StreamChunk

      if (c.delta?.content) {
        finalContent += c.delta.content
        onEvent({ type: 'text', content: finalContent })
      }
    }

    if (finalContent) {
      currentMessages.push({
        role: 'assistant',
        content: finalContent,
      })
    }
  }
}
