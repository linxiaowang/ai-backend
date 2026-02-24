export interface LLMProvider {
  chat: (
    messages: any[],
  ) => Promise<string>

  stream: (
    messages: any[],
    onChunk: (text: string) => void,
  ) => Promise<void>
}
