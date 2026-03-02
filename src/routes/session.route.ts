import type { Request, Response } from 'express'
import { Router } from 'express'
import { SessionManager } from '../sessions/session.manager'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const { userId } = req.query
  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ code: 'INVALID_PARAMS', message: 'Invalid userId' })
    return
  }
  const sessions = SessionManager.getByUserId(userId)
  res.json({ sessions })
})

export default router
