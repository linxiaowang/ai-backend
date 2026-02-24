import cors from 'cors'
import express from 'express'
import { config } from './config/env'
import chatRouter from './routes/chat.route'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/chat', chatRouter)

app.listen(config.port, () => {
  console.warn(`Server is running on port ${config.port}`)
})
