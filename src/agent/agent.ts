import { ModelFactory } from '../models/model.factory'
import { getToolDefinitions } from '../tools/tool.registry'
import { runLoop } from './agent.loop'

/**
 * Agent 入口：只做「跑 loop」，不写 HTTP/SSE、不写 session。
 */
export async function run(
  messages: any[],
  onChunk: (text: string) => void,
): Promise<void> {
  const provider = ModelFactory.createDefaultProvider()
  await runLoop(provider, messages, getToolDefinitions, onChunk)
}
