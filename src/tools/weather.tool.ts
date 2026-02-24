import type { Tool } from '../types'

export class WeatherTool implements Tool {
  name = 'get_weather'

  description = 'Get current weather of a city'

  parameters = {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: 'City name',
      },
    },
    required: ['city'],
  }

  async execute(args: any) {
    const { city } = args
    return `${city} today is 25°C and sunny.`
  }
}
