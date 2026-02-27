import type { StreamChunk } from '../models/llm.interface'
import type { LLMDelta } from './agent.types'

export function parseOpenAIDelta(chunk: StreamChunk): LLMDelta[] {
  const deltas: LLMDelta[] = []

  const delta = chunk.delta
  if (!delta)
    return deltas

  // 1️⃣ 内容
  if (delta.content) {
    deltas.push({
      type: 'content',
      text: delta.content,
    })
  }

  // 2️⃣ 工具调用
  if (delta.tool_calls?.length) {
    for (const d of delta.tool_calls) {
      deltas.push({
        type: 'tool_call_delta',
        index: d.index ?? 0,
        id: d.id,
        name: d.function?.name,
        arguments: d.function?.arguments,
      })
    }
  }

  // 3️⃣ 结束
  if (chunk.finishReason != null) {
    deltas.push({
      type: 'finish',
      reason: chunk.finishReason,
    })
  }

  return deltas
}
