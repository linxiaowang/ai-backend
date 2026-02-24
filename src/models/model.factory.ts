import type { LLMProvider } from './llm.interface'
import { OpenAIProvider } from './openai.provider'

export class ModelFactory {
  static createDefaultProvider(): LLMProvider {
    return new OpenAIProvider()
  }
}
