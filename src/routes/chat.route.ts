import { Router } from 'express'
import { chatHandler } from '../controllers/chat.controller'

const router = Router()

router.post('/', chatHandler)

export default router
