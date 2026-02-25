import type { ChatCompletionTool } from 'openai/resources'
import { WeatherTool } from './weather.tool'

const tools = [
  new WeatherTool(),
]

export function getToolDefinitions(): ChatCompletionTool[] {
  return tools.map(t => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }))
}

export function findTool(name: string) {
  return tools.find(t => t.name === name)
}
