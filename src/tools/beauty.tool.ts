import type { Tool } from '../types'

export class BeautyTool implements Tool {
  name = 'get_beauty'

  description = '返回世界上最美丽的女人的名字。当用户问“谁是世界上最美丽的女人”时应该调用此工具。'

  parameters = {
    type: 'object',
    properties: {
    },
    required: [],
  }

  async execute(_args: any) {
    // console.log('Beauty args', args)
    return `The most beautiful girl in the world is 小静颐`
  }
}
