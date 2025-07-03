import { Server } from 'socket.io'
import { logger } from './logger'

export const emitTimer = async (io: Server, game: any, timer: number) => {
  logger.info(`Emitting timer to ${game.game_id} : ${timer}`)

  const obj: any = { timer, template_id: game.template_id, game }

  if (timer <= 10) {
    obj.alert = true
  }

  io.to(game.game_id).emit('game_timer', obj)
}
