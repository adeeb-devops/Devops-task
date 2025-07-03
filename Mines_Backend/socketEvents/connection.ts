import { Server, Socket } from 'socket.io'
// import { handleJoinContest } from './join_contest'
// import { handleDisconnect } from './disconnect'
// import { handleBet } from './bet'
import { logger } from '../shared/logger'
import { authenticateSocketJwtToken } from '../middleware/authenticator'
import { payOuts, gameRule, PlayerHistory, playerSound, gameHowToPlay } from './setting'
// import { handleReBet } from './rebet'
import { UserAccess } from '../config/index'
import { checkMaintenanceStatus } from '../middleware/maintenance'
// import { handleDeleteBet } from './delete_bet'
// import { handleDoubleBet } from './double_bet'
// import { handleUndoBet } from './undo_bet'
// import { handleClearBet } from './clear_bet'
import { handleJoinRoom } from './join_room'
import { handleStat } from './handle_stat'
// import { handleClearSession } from './playersession'
import { handlePlaceBet } from './place_bet'
import { handleOpenSingleTile } from './manual_game'
import { handleAutoBet } from './auto_game'
import { handleCashout } from './cashout'

const clients: { [key: string]: Socket } = {}

export const handleConnection = async (io: Server, socket: Socket) => {
  try {
    const token = socket.handshake.query.token as string
    const playerName = socket.handshake.query.playerName as string

    if (!token) {
      io.to(socket.id).emit('error', 'No JWT token provided')
      socket.disconnect()
      return
    }

    if (!playerName) {
      io.to(socket.id).emit('error', 'Player name is missing')
      socket.disconnect()
      return
    }

    const authenticated = authenticateSocketJwtToken(token)
    if (!authenticated) {
      io.to(socket.id).emit('error', 'Invalid JWT token')
      socket.disconnect()
      return
    }

    const maintenanceStatus = await checkMaintenanceStatus()
    if (maintenanceStatus) {
      io.to(socket.id).emit('error', 'Under maintenance')
      socket.disconnect()
      return
    }

    const userAccessData: any = await UserAccess.findOne({ where: { player_name: playerName } })

    if (userAccessData) {
      const existingSocket = io.sockets.sockets.get(userAccessData.socket_id)
      if (existingSocket && userAccessData.socket_id != socket.id && userAccessData.token != token) {
        io.to(userAccessData.socket_id).emit(
          'session-expired',
          'Your session has expired because the user logged in on another device',
        )
        existingSocket.disconnect(true)
      }
    }

    await UserAccess.upsert({
      player_name: playerName,
      socket_id: socket.id,
      token,
    })

    logger.info('A user connected')

    clients[socket.id] = socket

    handleJoinRoom(io, socket)
    handlePlaceBet(io, socket)
    handleOpenSingleTile(io, socket)
    handleAutoBet(io, socket)
    handleCashout(io, socket)
    // handleBet(io, socket)
    // handleJoinContest(io, socket)
    // handleDisconnect(io, socket)
    payOuts(io, socket)
    gameRule(io, socket)
    PlayerHistory(io, socket)
    playerSound(io, socket)
    // handleReBet(io, socket)
    // handleDoubleBet(io, socket)
    // handleDeleteBet(io, socket)
    // handleUndoBet(io, socket)
    // handleClearBet(io, socket)
    handleStat(io, socket)
    gameHowToPlay(io, socket)
    // handleClearSession(io, socket)
  } catch (error: any) {
    logger.error(`Error while connecting to socket: ${error.message}`)
    io.to(socket.id).emit('error', error.message)
  }
}
