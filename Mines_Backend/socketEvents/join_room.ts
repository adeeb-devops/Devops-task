import { Server, Socket } from 'socket.io'
import { logger } from '../shared/logger'
import { redis } from '../config/redis'
import { Game, Template, Transaction, Player } from '../config'
import { checkPlayerStatus } from '../shared/utils'
import { checkMaintenanceStatus } from '../middleware/maintenance'

export const handleJoinRoom = (io: Server, socket: Socket) => {
  socket.on('join-socket-room', async (data) => {
    try {
      logger.info(`User joined game: ${data}`)
      const { player_name: playerName, is_jackpot: isJackpot = false, template_id: templateId } = data

      if (!playerName) {
        throw new Error('Invalid player information')
      }

      const playerStatus = await checkPlayerStatus(playerName)
      if (!playerStatus.valid) {
        socket.emit(
          'error',
          `An error occurred while processing your request. Please try again. --${playerStatus.message}`,
        )
        return
      }

      const maintenanceStatus = await checkMaintenanceStatus()
      if (maintenanceStatus) {
        socket.emit(
          'error',
          `An error occurred while processing your request. Please try again. --Game is under maintenance`,
        )
        return
      }

      // await getMaxAllowableWinningAmount()

      if (!templateId) {
        throw new Error('Invalid template information')
      }

      const template: any = await Template.findByPk(templateId)

      if (!template) throw new Error('Game template not available')
      if (!template.active) throw new Error('Game template unavailable')
      if (template.is_disabled) throw new Error('Game template access denied')

      const [game, created] = await Game.findOrCreate({
        where: {
          player_name: playerName,
          template_id: templateId,
          active: true,
          is_jackpot: isJackpot,
        },
        defaults: {
          player_name: playerName,
          template_id: templateId,
          is_jackpot: isJackpot,
        },
      })

      const gameId = (game as any)['game_id']
      const id = (game as any)['id']

      if (created) {
        const player = await Player.findOne({
          where: {
            player_name: playerName,
          },
        })

        if (!player) throw new Error(`Player not found with player name: ${playerName}`)
        await Transaction.create({
          game_id: gameId,
          player_name: playerName,
          opening_balance: player?.balance || 0,
        })
      }

      const sessionId = `mines-${playerName}-${gameId}`

      const sessionData = await redis.hgetall(sessionId)
      const betData = sessionData.betData ? JSON.parse(sessionData.betData) : []

      let gameState = {}

      if (betData?.length > 0) {
        gameState = betData[betData.length - 1]
      }

      const redisFields = {
        playerName,
        totalBetAmount: Number(sessionData.totalBetAmount || 0),
        totalWinAmount: Number(sessionData.totalWinAmount || 0),
        bonusWinAmount: Number(sessionData.bonusWinAmount || 0),
        betData: JSON.stringify(betData),
      }

      await redis.hset(sessionId, redisFields)

      socket.join(sessionId)
      io.to(sessionId).emit('init-game', {
        message: `Player ${playerName} joined the game`,
        id,
        gameId: gameId,
        isJackpot: isJackpot,
        grid_options: template.grid_options || [],
        gameState,
      })
    } catch (error: any) {
      logger.error(`Error while joining the room: ${error.message}`)
      io.to(socket.id).emit(
        'error',
        `An error occurred while processing your request. Please try again. --${error.message}`,
      )
    }
  })
}
