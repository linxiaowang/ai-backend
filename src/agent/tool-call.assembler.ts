import type { CompletedToolCall, LLMDelta } from './agent.types'

export class ToolCallAssembler {
  private buffers: Record<number, CompletedToolCall> = {}
  private hasCalls = false

  process(event: LLMDelta) {
    if (event.type !== 'tool_call_delta')
      return

    this.hasCalls = true

    const idx = event.index

    const buf = this.buffers[idx] ?? {
      id: event.id,
      type: 'function',
      function: { name: '', arguments: '' },
    }

    if (event.id)
      buf.id = event.id
    if (event.name)
      buf.function.name = event.name
    if (event.arguments)
      buf.function.arguments += event.arguments

    this.buffers[idx] = buf
  }

  hasToolCalls() {
    return this.hasCalls
  }

  getCompleted(): CompletedToolCall[] {
    return Object.keys(this.buffers)
      .map(Number)
      .sort((a, b) => a - b)
      .map(i => this.buffers[i])
  }
}
