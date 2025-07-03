import { Server, Socket } from 'socket.io'
import { logger } from '../shared/logger'
import { Game } from '../config'
import { sequelize } from '../config/db'

export const handleStat = (io: Server, socket: Socket) => {
  socket.on('stat', async (data) => {
    try {
      logger.info(`Stat popup: ${data}`)
      const { player_name: playerName, template_id: templateId, game_type: gameTpe, is_jackpot: isJackpot } = data

      if (!playerName) throw new Error('Missing playerName')

      const whereObj: any = { player_name: playerName, active: false }

      if (templateId) whereObj.template_id = templateId
      if (gameTpe) whereObj.game_type = gameTpe
      if (isJackpot) whereObj.is_jackpot = isJackpot

      const history = await Game.findOne({
        where: whereObj,
        attributes: [
          [sequelize.fn('SUM', sequelize.col('betting_amount')), 'total_bet_amount'],
          [sequelize.fn('SUM', sequelize.col('winning_amount')), 'total_winning_amount'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN winning_amount > 0 THEN 1 END')), 'total_win'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN winning_amount = 0 THEN 1 END')), 'total_loss'],
        ],
        raw: true,
      })

      io.to(socket.id).emit('stat-data', { statData: history })
    } catch (error: any) {
      logger.error(`Error while joining the room : ${error.message}`)
      io.to(socket.id).emit('error', error?.message)
      return
    }
  })
}
