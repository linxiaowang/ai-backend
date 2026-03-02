import type { Request, Response } from 'express'
import { ChatService } from '../services/chat.service'

export async function chatHandler(req: Request, res: Response) {
  const { sessionId, message, userId } = req.body

  if (!userId || typeof userId !== 'string' || !message || typeof message !== 'string') {
    res.status(400).json({ code: 'INVALID_PARAMS', message: 'Invalid userId or message' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    await ChatService.handleChat(
      sessionId,
      userId,
      message,
      (chunk) => {
        console.log('chunk', chunk)
        res.write(`data: ${JSON.stringify(chunk)}\n\n`)
      },
    )

    res.write('data: [DONE]\n\n')
    res.end()
  }
  catch (error) {
    console.error(error)
    const message = error instanceof Error ? error.message : '服务异常'
    res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`)
    res.end()
  }
}
