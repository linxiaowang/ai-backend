import { findTool } from '../tools/tool.registry'

/**
 * 工具执行 + fallback：未知工具或异常时返回固定文案，不抛。
 */
export async function executeTool(name: string, argsJson: string): Promise<string> {
  const tool = findTool(name)
  if (!tool) {
    return `未知工具: ${name}`
  }

  try {
    const args = argsJson.trim() ? JSON.parse(argsJson) : {}
    return await tool.execute(args)
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Tool execute error:', error)
    return `工具执行失败: ${message}`
  }
}
