import type { LLMProvider, StreamChunk, StreamRawOptions } from './llm.interface'
import OpenAI from 'openai'
import { config } from '../config/env'

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openaiApiKey,
      baseURL: config.openaiBaseURL,
    })
  }

  async* streamRaw(
    messages: any[],
    options?: StreamRawOptions,
  ): AsyncGenerator<StreamChunk> {
    const body = {
      model: config.openaiModel,
      messages,
      stream: true as const,
      ...(options?.tools?.length && {
        tools: options.tools,
        tool_choice: (options.tool_choice ?? 'auto') as 'auto',
      }),
    }

    const stream = await this.client.chat.completions.create(body)

    for await (const chunk of stream) {
      const choice = chunk.choices[0]
      if (!choice)
        continue
      console.log('chunk', JSON.stringify(chunk, null, 2))
      const delta = choice.delta
      // console.log('delta', JSON.stringify(delta, null, 2))

      yield {
        delta: {
          content: delta.content ?? undefined,
          tool_calls: delta.tool_calls?.map((tc: {
            index?: number
            id?: string
            type?: string
            function?: { name?: string, arguments?: string }
          }) => ({
            index: tc.index,
            id: tc.id ?? undefined,
            type: tc.type ?? undefined,
            function: tc.function
              ? {
                  name: tc.function.name ?? undefined,
                  arguments: tc.function.arguments ?? undefined,
                }
              : undefined,
          })),
        },
        finishReason: choice.finish_reason ?? undefined,
      }
    }
  }

  async chat(messages: any[]) {
    const res = await this.client.chat.completions.create({
      model: config.openaiModel,
      messages,
    })

    const content = res.choices[0]?.message?.content ?? ''
    return content
  }
}
