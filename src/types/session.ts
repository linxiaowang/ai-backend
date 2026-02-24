import type { Message } from './message'

export interface Session {
  id: string
  messages: Message[]
  metadata?: {
    model?: string
    totalTokens?: number
  }
  createdAt: number
  updatedAt: number
}
