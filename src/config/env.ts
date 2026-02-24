import 'dotenv/config'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value)
    throw new Error(`Missing environment variable: ${name}`)

  return value
}

export const config = {
  port: Number.parseInt(process.env.PORT || '', 10) || 3030,
  openaiApiKey: requireEnv('OPENAI_API_KEY'),
  openaiBaseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com/v1',
  openaiModel: process.env.OPENAI_MODEL || 'deepseek-chat',
  maxSessionMessages: Number.parseInt(process.env.MAX_SESSION_MESSAGES || '', 10) || 12,
}
