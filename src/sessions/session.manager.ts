import type { Message, Session } from '../types'
import { trimMessages } from '../utils/trimMessages'

const sessions = new Map<string, Session>()

export class SessionManager {
  static get(sessionId: string): Session {
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        id: sessionId,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    return sessions.get(sessionId)!
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
