import type { Message } from '../types'

export function trimMessages(
  messages: Message[],
  maxMessages = 12,
): Message[] {
  if (messages.length <= maxMessages)
    return messages

  return messages.slice(-maxMessages)
}
