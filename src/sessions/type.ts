export type ChatMessage
  = | { role: 'system', content: string }
    | { role: 'user', content: string }
    | { role: 'assistant', content: string }
    | { role: 'tool', content: string, toolName: string }
