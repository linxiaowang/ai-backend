import type { Message, Session } from '../types'
import { trimMessages } from '../utils/trimMessages'

const sessions = new Map<string, Session>()

export class SessionManager {
  static get(sessionId: string): Session {
    const existing = sessions.get(sessionId)
    if (!existing) {
      throw new Error(`Session ${sessionId} not found`)
    }
    return existing
  }

  static getByUserId(userId: string): Session[] {
    return Array.from(sessions.values()).filter(session => session.userId === userId)
  }

  static create(userId: string): string {
    const sessionId = crypto.randomUUID()
    sessions.set(sessionId, {
      id: sessionId,
      name: '未命名',
      userId,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    return sessionId
  }

  static setTitle(sessionId: string, title: string) {
    const session = this.get(sessionId)
    session.name = title
    session.updatedAt = Date.now()
  }

  static append(sessionId: string, message: Message) {
    const session = this.get(sessionId)
    session.messages.push(message)
    session.updatedAt = Date.now()
  }

  static trim(sessionId: string, maxMessages = 12) {
    const session = this.get(sessionId)
    session.messages = trimMessages(session.messages, maxMessages)
  }
}
