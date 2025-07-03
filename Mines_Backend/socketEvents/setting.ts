import { Server, Socket } from 'socket.io'
import { getPayouts } from '../controller/setting'
import { Game, Player, Rules, HowToPlay } from '../config/index'

export const gameRule = (io: Server, socket: Socket) => {
  socket.on('rule', async () => {
    try {
      const rules = await Rules.findAll({
        where: {},
        order: [['updated_at', 'DESC']],
      })

      io.to(socket.id).emit('rule-data', rules)
    } catch (error: any) {
      io.to(socket.id).emit('error', error.message)
    }
  })
}

export const payOuts = (io: Server, socket: Socket) => {
  socket.on('payouts', async (data: any) => {
    try {
      let payout = getPayouts()

      if (data.is_jackpot) {
        payout = getPayouts('jackpot')
      }

      if (data.tiles_count) {
        payout = payout[data.tiles_count.toString()]

        if (data.mines_count) {
          payout = payout[data.mines_count.toString()]
        }
      }

      io.to(socket.id).emit('payout-data', payout)
    } catch (error: any) {
      io.to(socket.id).emit('error', error.message)
    }
  })
}

export const PlayerHistory = async (io: Server, socket: Socket) => {
  socket.on('player-history', async (data) => {
    try {
      const {
        player_name: playerName,
        template_id: templateId,
        game_type: gameTpe,
        is_jackpot: isJackpot,
        limit,
        offset,
      } = data

      if (!playerName) throw new Error('Missing playerName')

      const whereObj: any = { player_name: playerName, active: false }

      if (templateId) whereObj.template_id = templateId
      if (gameTpe) whereObj.game_type = gameTpe
      if (isJackpot) whereObj.is_jackpot = isJackpot

      const history = await Game.findAll({
        where: whereObj,
        attributes: [
          'game_id',
          'bets',
          'game_type',
          'is_jackpot',
          'betting_amount',
          'winning_amount',
          'jackpot_amount',
          'payout_multiplier',
          'created_at',
          'updated_at',
        ],
        order: [['updated_at', 'DESC']],
        ...(limit && offset ? { limit: Number(limit), offset: Number(offset) } : {}),
      })

      io.to(socket.id).emit('player-history-data', history)
    } catch (error: any) {
      io.to(socket.id).emit('error', error.message)
    }
  })
}

export const playerSound = (io: Server, socket: Socket) => {
  socket.on('player-sound', async (data: any) => {
    try {
      const { player_name: playerName, sound, vibration } = data

      await Player.update(
        {
          sound,
          vibration,
        },
        {
          where: {
            player_name: playerName,
          },
        },
      )

      io.to(socket.id).emit('sound-updated', { message: 'Sound updated successfully' })
    } catch (error: any) {
      io.to(socket.id).emit('error', error.message)
    }
  })
}

export const gameHowToPlay = (io: Server, socket: Socket) => {
  socket.on('how-to-play', async () => {
    try {
      const howToPlay = await HowToPlay.findAll({
        where: {},
        order: [['updated_at', 'DESC']],
      })

      io.to(socket.id).emit('how-to-play-data', howToPlay)
    } catch (error: any) {
      io.to(socket.id).emit('error', error.message)
    }
  })
}
