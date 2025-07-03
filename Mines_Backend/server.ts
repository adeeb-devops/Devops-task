import 'dotenv/config'
import { logger } from './shared/logger'
import createServer from './app'
import { connectDb } from './config/db'
import { redis } from './config/redis'
import { loadEnv } from './shared/env'
import { createServer as createHttpServer } from 'http'
import { initializeWebSocketServer } from './socket'
import { createAdminIfNotExists } from './config/seed'
import { initializeTable } from './shared/initializeDb'

const startServer = async () => {
  const port = process.env.PORT || 8000
  const app = createServer()

  try {
    loadEnv()
    await connectDb()
    logger.info(`Connected successfully to the database.`)
    await initializeTable()

    const httpServer = createHttpServer(app)

    initializeWebSocketServer(httpServer)
    await createAdminIfNotExists()

    await redis.hset('testing', 'test', 1)
    await redis.del('testing')

    httpServer.listen(port, async () => {
      logger.info(`Server is running on port ${port}.`)
    })
  } catch (error) {
    logger.error(`Failed to start server: ${(error as Error).message}`)
    process.exit(1)
  }
}

startServer()
