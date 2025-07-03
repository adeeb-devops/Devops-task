import { Socket, Server } from 'socket.io'
import { logger } from '../shared/logger'
import { redis } from '../config/redis'
import { creatingUserUndoMapData } from '../shared/bet_logic'
import { getPlayerWaitage } from '../shared/utils'

export const handleUndoBet = (io: Server, socket: Socket) => {
  socket.on('undo-bet', async (data) => {
    try {
      logger.info(`Undo bet request received from client ${socket.id}: ${JSON.stringify(data)}`)
      const { player_name: playerName, contest_id: contestId } = data

      if (!playerName) throw new Error('Missing player name')
      if (!contestId) throw new Error('Missing game id')

      const sessionId = `mines-${playerName}-${contestId}`

      const actionStack: any = await redis.lrange(`mines-actionStack-${sessionId}`, 0, -1)

      if (actionStack.length === 0) {
        throw new Error('No actions to undo')
      }

      const lastAction = JSON.parse(actionStack.pop())

      const hashData = await redis.hgetall(sessionId)
      let betData = JSON.parse(hashData.betData || '[]') || []
      let betMapData = JSON.parse(hashData.betMapData || '{}') || {}
      let totalBetAmount = Number(hashData.totalBetAmount) || 0

      const waitageData = hashData?.waitageData ? hashData?.waitageData : await getPlayerWaitage(playerName)

      let playerBalance: number = Number(await redis.hget(`balance-${playerName}`, 'balance'))

      if (lastAction.type === 'bet') {
        const betIndex = betData.findIndex((bet: any) => bet.transaction_id === lastAction.transaction_id)

        if (betIndex !== -1) {
          const betToUndo = betData[betIndex]

          betMapData = creatingUserUndoMapData(betToUndo.mines, betToUndo.bet_amount, betMapData)

          playerBalance += Number(betToUndo.bet_amount)
          totalBetAmount -= Number(betToUndo.bet_amount)

          betData.splice(betIndex, 1)
        } else {
          logger.info(`Bet with transaction ID ${lastAction.transaction_id} not found in betData`)
        }
      } else if (lastAction.type === 'double-bet') {
        for (const bet of betData) {
          betMapData = creatingUserUndoMapData(bet.mines, bet.bet_amount, betMapData)

          const originalBetAmount = bet.bet_amount / 2

          bet.bet_amount = originalBetAmount

          bet.winning_amount = Number(originalBetAmount) * 10
        }

        playerBalance += Number(lastAction.totalBetAmount)
        totalBetAmount -= Number(lastAction.totalBetAmount) / 2
      } else if (lastAction.type === 'delete') {
        const { bet } = lastAction
        const { bet_amount: betAmount } = bet

        playerBalance -= Number(betAmount)
        totalBetAmount += Number(betAmount)

        betData.push(bet)
      } else if (lastAction.type === 're-bet') {
        totalBetAmount = 0
        betData = []
        betMapData = {}

        playerBalance += Number(lastAction.totalBetAmount)
      }

      await redis.hset(sessionId, {
        playerName: playerName,
        contestId: contestId,
        betData: JSON.stringify(betData),
        betMapData: JSON.stringify(betMapData),
        totalBetAmount: totalBetAmount,
        waitageData,
      })

      await redis.hset(`balance-${playerName}`, 'balance', playerBalance)

      await redis.rpop(`mines-actionStack-${sessionId}`)

      io.to(socket.id).emit('bet-data', betData)
      io.to(socket.id).emit('update-balance', playerBalance)
    } catch (error: any) {
      logger.error(`Error while undoing the bet: ${error.message}`)
      io.to(socket.id).emit('error', error.message)
    }
  })
}
