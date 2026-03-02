import type { AgentEvent } from '../agent/agent.types'
import type { Message } from '../types/message'
import { run as agentRun } from '../agent/agent'
import { SessionManager } from '../sessions/session.manager'

/** 将 Message.content（string | AgentEvent[]）转为 OpenAI API 所需的字符串 */
function messageContentToText(content: Message['content']): string {
  if (typeof content === 'string')
    return content
  return content
    .filter((e): e is { type: 'text', content: string } => e.type === 'text')
    .map(e => e.content)
    .join('')
}

async function generateTitleFromUserInput(userInput: string, sessionId: string, onEvent: (data: AgentEvent) => void): Promise<void> {
  const systemPrompt = `你是一个对话标题生成助手。
现在给你一段「用户的输入内容」，你需要帮我生成一个简短的中文标题，要求：
1. 不超过 15 个汉字
2. 概括对话的核心主题
3. 不要带引号，不要带标点
4. 不要体现具体轮次、时间等信息（例如“第一次对话”、“今天的问题”等）`
  const userPrompt = `下面是用户的输入内容：\n\n${userInput}\n\n请直接输出标题，不要解释。`
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]
  let title = ''
  await agentRun(messages, (event) => {
    console.log('event2', event)

    if (event.type === 'text')
      title += event.content
  })

  const cleanTitle = title.trim().replace(/["“”]/g, '').slice(0, 15) || '新对话'
  SessionManager.setTitle(sessionId, cleanTitle)
  onEvent({
    type: 'session_title_updated',
    sessionId,
    sessionName: cleanTitle,
  })
}

export class ChatService {
  static async handleChat(
    sessionId: string,
    userId: string,
    userInput: string,
    onEvent: (data: AgentEvent) => void,
  ) {
    const isNewSession = !sessionId
    if (isNewSession) {
      sessionId = SessionManager.create(userId)
      onEvent({ type: 'session_created', sessionId, sessionName: '新对话' })
      await generateTitleFromUserInput(userInput, sessionId, onEvent)
    }

    SessionManager.append(sessionId, {
      id: crypto.randomUUID(),
      role: 'user',
      content: [{ type: 'text', content: userInput }],
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
        content: messageContentToText(m.content),
      })),
    ]

    const assistantContent: AgentEvent[] = []

    await agentRun(modelMessages, (chunk) => {
      assistantContent.push(chunk)
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
