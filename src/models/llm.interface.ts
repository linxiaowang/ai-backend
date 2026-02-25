/** 原始流 chunk，与具体模型解耦 */
export interface StreamChunk {
  delta?: {
    content?: string
    tool_calls?: Array<{
      index?: number
      id?: string
      type?: string
      function?: { name?: string, arguments?: string }
    }>
  }
  finishReason?: string | null
}

export interface StreamRawOptions {
  tools?: any[]
  tool_choice?: string
}

export interface LLMProvider {
  chat: (messages: any[]) => Promise<string>

  /** 只负责发请求、产出原始流；不解析业务、不执行工具。由 Agent 消费并驱动 tool loop。 */
  streamRaw: (
    messages: any[],
    options?: StreamRawOptions,
  ) => AsyncGenerator<StreamChunk>
}
