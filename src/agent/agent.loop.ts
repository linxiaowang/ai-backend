import type { LLMProvider, StreamChunk } from '../models/llm.interface'
import type { CompletedToolCall } from './agent.types'
import { executeTool } from './agent.executor'

const MAX_TOOL_ROUNDS = 5

export type GetToolDefinitions = () => any[]

export async function runLoop(
  provider: LLMProvider,
  messages: any[],
  getToolDefinitions: GetToolDefinitions,
  onChunk: (text: string) => void,
): Promise<void> {
  let currentMessages = [...messages]
  let round = 0

  while (round < MAX_TOOL_ROUNDS) {
    round++
    const tools = getToolDefinitions()
    const stream = provider.streamRaw(currentMessages, {
      tools,
      tool_choice: 'auto',
    })

    const toolCallBuffers: Record<number, CompletedToolCall> = {}
    let hasToolCalls = false
    let finishReason: string | null = null

    for await (const chunk of stream) {
      const c = chunk as StreamChunk
      if (c.delta?.content) {
        onChunk(c.delta.content)
      }

      if (c.delta?.tool_calls?.length) {
        hasToolCalls = true
        for (const d of c.delta.tool_calls) {
          const idx = d.index ?? 0
          const buf = toolCallBuffers[idx] ?? {
            id: d.id,
            type: d.type,
            function: { name: '', arguments: '' },
          }
          if (d.id)
            buf.id = d.id
          if (d.function?.name)
            buf.function.name = d.function.name
          if (d.function?.arguments)
            buf.function.arguments += d.function.arguments
          toolCallBuffers[idx] = buf
        }
      }

      if (c.finishReason != null) {
        finishReason = c.finishReason
      }
    }

    if (!hasToolCalls || finishReason !== 'tool_calls') {
      break
    }

    const completedToolCalls = Object.keys(toolCallBuffers)
      .map(Number)
      .sort((a, b) => a - b)
      .map(i => toolCallBuffers[i])

    currentMessages = [
      ...currentMessages,
      {
        role: 'assistant',
        tool_calls: completedToolCalls.map((tc, i) => ({
          id: tc.id ?? `tool_call_${i}`,
          type: tc.type ?? 'function',
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments,
          },
        })),
      },
    ]

    for (let i = 0; i < completedToolCalls.length; i++) {
      const tc = completedToolCalls[i]
      const toolCallId = tc.id ?? `tool_call_${i}`
      const result = await executeTool(tc.function.name, tc.function.arguments)
      currentMessages.push({
        role: 'tool',
        tool_call_id: toolCallId,
        content: result,
      })
    }
  }
}
