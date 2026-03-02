import type { AgentEvent } from '../agent/agent.types'

export type Role
  = | 'system'
    | 'user'
    | 'assistant'
    | 'tool'

/**
 * 单条对话消息的元信息
 * - 不直接参与模型输入，但方便做统计 / 调试
 */
export interface MessageMetadata {
  // 大致 token 数（可以用字符数 /3 /4 粗略估）
  approxTokens: number

  // 工具调用相关（当 role === 'tool' 时有意义）
  toolName?: string
  toolCallId?: string

  // 是否由摘要生成 / 合并而来
  isFromSummary?: boolean
  originalMessageId?: string[]

}
/**
 * 领域层 Message，既可以在内存里用，也可以直接持久化到 MySQL/Redis
 */
export interface Message {
  id: string
  role: Role
  content: AgentEvent[]
  name?: string // 可用于 assistant 的 function 名 / tool 名
  createdAt: number
  // 可选元数据，保持向后兼容
  metadata?: MessageMetadata
}
