export interface Tool {
  name: string
  description: string
  parameters: any

  execute: (args: any) => Promise<string>
}
