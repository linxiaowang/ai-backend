import type { Message } from './message'

/**
 * Session 级元信息：模型、token 统计等
 */
export interface SessionMetadata {
  model?: string // 本会话主要使用的模型
  totalTokensApprox?: number // 粗略统计本会话消耗 token
  title?: string // 会话标题（可选，用于前端展示）
}

/**
 * 会话摘要结构，用于“上下文自动压缩”
 */
export interface SessionSummary {
  id: string
  sessionId: string

  // 摘要内容，通常会作为一条额外的 system/assistant 消息加入上下文
  content: string

  // 摘要涵盖到哪一条消息（含）
  upToMessageId?: string

  // 大致 token 数，方便做二次裁剪
  approxTokens?: number

  createdAt: number
}

export interface Session {
  id: string
  // 多用户支持：归属哪个用户
  name: string
  userId: string
  messages: Message[]
  metadata?: SessionMetadata
  // 当前最新摘要（如果有自动压缩）
  summary?: SessionSummary
  createdAt: number
  updatedAt: number
}
