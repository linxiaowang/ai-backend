import type { LLMProvider } from '../models/llm.interface'
import { ModelFactory } from '../models/model.factory'
import { SessionManager } from '../sessions/session.manager'

const provider: LLMProvider = ModelFactory.createDefaultProvider()

export class ChatService {
  static async handleChat(
    sessionId: string,
    userInput: string,
    onChunk: (text: string) => void,
  ) {
    // 1️⃣ 追加用户消息
    SessionManager.append(sessionId, {
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput,
      createdAt: Date.now(),
    })

    // 2️⃣ 裁剪上下文
    SessionManager.trim(sessionId)

    const session = SessionManager.get(sessionId)

    // 3️⃣ 构造模型输入
    const modelMessages = [
      { role: 'system', content: 'You are helpful assistant.' },
      ...session.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    ]

    let assistantContent = ''

    // 4️⃣ 流式调用
    await provider.stream(
      modelMessages,
      (chunk) => {
        assistantContent += chunk
        onChunk(chunk)
      },
    )

    // 5️⃣ 保存 assistant 消息
    SessionManager.append(sessionId, {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: assistantContent,
      createdAt: Date.now(),
    })
  }
}
