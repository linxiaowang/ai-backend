export type Role
  = | 'system'
    | 'user'
    | 'assistant'
    | 'tool'

export interface Message {
  id: string
  role: Role
  content: string
  name?: string
  createdAt: number
}
