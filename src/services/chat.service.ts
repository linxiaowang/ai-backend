import { run as agentRun } from '../agent/agent'
import { SessionManager } from '../sessions/session.manager'

export class ChatService {
  static async handleChat(
    sessionId: string,
    userInput: string,
    onChunk: (text: string) => void,
  ) {
    SessionManager.append(sessionId, {
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput,
      createdAt: Date.now(),
    })

    SessionManager.trim(sessionId)

    const session = SessionManager.get(sessionId)

    const modelMessages = [
      { role: 'system', content: 'You are helpful assistant.' },
      ...session.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    ]

    let assistantContent = ''

    await agentRun(modelMessages, (chunk) => {
      assistantContent += chunk
      onChunk(chunk)
    })

    SessionManager.append(sessionId, {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: assistantContent,
      createdAt: Date.now(),
    })
  }
}
