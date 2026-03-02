/** 统一 JSON 错误响应体 */
export interface ApiErrorBody {
  code: string
  message: string
}

/** SSE 流错误事件（写入 data 行） */
export interface SSEErrorEvent {
  type: 'error'
  message: string
}
