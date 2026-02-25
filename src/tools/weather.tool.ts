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
    console.log('Weather args', args)
    const { city } = args
    return `${city} 今天 0 度，有点冷.`
  }
}
