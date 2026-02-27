import type { AgentEvent } from '../agent/agent.types'
import { run as agentRun } from '../agent/agent'
import { SessionManager } from '../sessions/session.manager'

export class ChatService {
  static async handleChat(
    sessionId: string,
    userInput: string,
    onEvent: (data: AgentEvent) => void,
  ) {
    SessionManager.append(sessionId, {
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput,
      createdAt: Date.now(),
    })

    SessionManager.trim(sessionId)

    const session = SessionManager.get(sessionId)
    const AGENT_SYSTEM_PROMPT = `
You are a helpful assistant.

When you need to use a tool, call the tool.
Otherwise, directly answer the user.
Do not output your reasoning.
    `
    const modelMessages = [
      { role: 'system', content: AGENT_SYSTEM_PROMPT },
      ...session.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    ]

    let assistantContent = ''

    await agentRun(modelMessages, (chunk) => {
      assistantContent += chunk
      onEvent(chunk)
    })

    SessionManager.append(sessionId, {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: assistantContent,
      createdAt: Date.now(),
    })
  }
}
