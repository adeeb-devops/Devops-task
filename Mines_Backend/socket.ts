import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { logger } from './shared/logger'
import { handleConnection } from './socketEvents/connection'
import HttpException from './shared/http-exception'
let io: SocketIOServer

export const initializeWebSocketServer = (httpServer: HttpServer) => {
  try {
    io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    })

    io.on('connection', async (socket) => await handleConnection(io, socket))

    logger.info('WebSocket server initialized and running.')
    return io
  } catch (error: any) {
    logger.error(`error: ${error.message}`)
    throw new HttpException(error.message)
  }
}

export { io }
