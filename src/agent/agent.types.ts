/** 单轮流式结束后聚合得到的一条 tool call（用于拼 assistant + tool 消息） */
export interface CompletedToolCall {
  id?: string
  type?: string
  function: {
    name: string
    arguments: string
  }
}

export type AgentEvent
  = | {
    type: 'thought'
    content: string
  }
  | {
    type: 'tool_call'
    name: string
    args: any
  }
  | {
    type: 'tool_result'
    content: any
  }
  | {
    type: 'text'
    content: string
  }
  | {
    type: 'session_created'
    sessionId: string
    sessionName: string
  }
  | {
    type: 'session_title_updated'
    sessionId: string
    sessionName: string
  }

export type LLMDelta
  = | { type: 'content', text: string }
    | {
      type: 'tool_call_delta'
      index: number
      id?: string
      name?: string
      arguments?: string
    }
    | { type: 'finish', reason: string | null }
