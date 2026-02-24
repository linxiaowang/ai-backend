import type { Request, Response } from 'express'
import { ChatService } from '../services/chat.service'

export async function chatHandler(req: Request, res: Response) {
  const { sessionId, message } = req.body

  if (!sessionId || typeof sessionId !== 'string' || !message || typeof message !== 'string') {
    res.status(400).json({ error: 'Invalid sessionId or message' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    await ChatService.handleChat(
      sessionId,
      message,
      (chunk) => {
        res.write(`data: ${chunk}\n\n`)
      },
    )

    res.write('data: [DONE]\n\n')
    res.end()
  }
  catch (error) {
    // 简单错误处理，避免中间抛错导致连接挂死

    console.error(error)
    res.write('data: [ERROR]\n\n')
    res.end()
  }
}
