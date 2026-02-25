/** 单轮流式结束后聚合得到的一条 tool call（用于拼 assistant + tool 消息） */
export interface CompletedToolCall {
  id?: string
  type?: string
  function: {
    name: string
    arguments: string
  }
}
