import { Server, Socket } from 'socket.io'
import { logger } from '../shared/logger'
import { UserAccess } from '../config'
import { redis } from '../config/redis'

export const handleDisconnect = (io: Server, socket: Socket) => {
  socket.on('disconnect', async (data: any) => {
    try {
      logger.info(`A user disconnected: ${data.reason}`)
      logger.info(`Disconnect ${JSON.stringify(data)}`)

      const userAccessData: any = await UserAccess.findOne({ where: { socket_id: socket.id } })

      logger.info(`Player last session of useraccessdata in disconnect event: ${userAccessData?.player_name}`)

      if (userAccessData) {
        const { player_name: playerName } = userAccessData

        const betRedisData = await redis.hgetall(playerName)
        logger.info(`Player last session before deletion in disconnect event: ${JSON.stringify(betRedisData)}`)

        const { contest_id: contestId, template_id: templateId, game_id: gameId } = betRedisData || {}

        if (contestId && templateId && gameId) {
          const sessionId = `mines-${playerName}-${contestId}`

          await socket.leave(gameId)
          await socket.leave(sessionId)

          const totalUsersInGameRoom = io.sockets.adapter.rooms.get(gameId)?.size || 0

          logger.info(`Player last session totalUsersInGameRoom in disconnect event: ${totalUsersInGameRoom}`)

          // await Template.update(
          //   {
          //     online_players: totalUsersInGameRoom,
          //   },
          //   {
          //     where: {
          //       id: templateId,
          //     },
          //   },
          // )
        }

        await redis.del(playerName)

        const delData = await redis.hgetall(playerName)

        logger.info(`Player last session after deletion in disconnect event: ${JSON.stringify(delData)}`)
      } else {
        logger.error(`No user access data found with socket id: ${socket.id}`)
      }
    } catch (error: any) {
      io.to(socket.id).emit('error', error.message)
    }
  })
}
