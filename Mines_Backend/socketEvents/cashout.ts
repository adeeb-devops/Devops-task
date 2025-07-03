import { Server, Socket } from 'socket.io'
import { logger } from '../shared/logger'
import { redis } from '../config/redis'
import { saveContestData, getTemplateData, updatePlayerBalance } from '../shared/utils'
import { Player } from '../config'

const INVALID_REQUEST_ERROR = 'Invalid request data'

interface Round {
  field: number
  payoutMultiplier: number
}

interface BetState {
  minesCount: number
  totalTiles: number
  jackpot?: number[]
  mines?: number[]
  rounds: Round[]
}

interface Bet {
  game_id: string
  active: boolean
  state: BetState
  payoutMultiplier: string
  payout: number
  amount: number
  updatedAt: string
}

const generateMineLocations = (totalTiles: number, openedFields: number[], targetMines: number): number[] => {
  const mineLocations = new Set<number>([])

  while (mineLocations.size < targetMines) {
    const minePos = Math.floor(Math.random() * totalTiles)
    if (!openedFields.includes(minePos) && !mineLocations.has(minePos)) {
      mineLocations.add(minePos)
    }
  }

  return Array.from(mineLocations)
}

export const handleCashout = (io: Server, socket: Socket) => {
  socket.on('cashout', async (data) => {
    try {
      logger.info(`Cash out by ${socket.id}: ${JSON.stringify(data)}`)

      const { player_name: playerName, game_id: gameId, is_jackpot: isJackpot = false, template_id: templateId } = data
      if (!gameId || !playerName) throw new Error(INVALID_REQUEST_ERROR)

      const sessionId = `mines-${playerName}-${gameId}`
      const sessionData = await redis.hgetall(sessionId)
      if (!sessionData || !sessionData.betData) throw new Error('Game session not found.')

      const betData: Bet[] = JSON.parse(sessionData.betData)
      if (!betData.length) throw new Error('Bet data is empty.')

      const currentBet = betData[betData.length - 1]
      if (!currentBet.active) throw new Error('Invalid or inactive bet.')

      let rakePercentage = 0

      if (templateId) {
        const existingTemplate: any = await getTemplateData(templateId)

        rakePercentage = existingTemplate?.rake_percentage / 100 || 0
      }

      const { rounds, minesCount, totalTiles } = currentBet.state

      currentBet.active = false

      const mineLocations = generateMineLocations(
        totalTiles,
        rounds.map((round) => round.field),
        minesCount,
      )
      currentBet.state.mines = mineLocations

      if (isJackpot && Array.isArray(currentBet.state.jackpot) && currentBet.state.jackpot.length === 0) {
        const invalidFields = new Set<number>([...rounds.map((round) => round.field), ...mineLocations])

        const validFields = Array.from({ length: totalTiles }, (_, index) => index).filter(
          (tile) => !invalidFields.has(tile),
        )

        if (validFields.length > 0) {
          const randomIndex = Math.floor(Math.random() * validFields.length)
          currentBet.state.jackpot.push(validFields[randomIndex])
        }
      }

      let winAmount = Number(currentBet.amount) * Number(currentBet.payout)

      const winningMinusBetting = winAmount - Number(currentBet.amount)
      const updatedCommissionAmount =
        winningMinusBetting > 0 && rakePercentage ? winningMinusBetting * rakePercentage : 0

      winAmount -= updatedCommissionAmount

      await saveContestData(
        currentBet,
        'manual',
        0,
        winAmount + Number(sessionData.bonusWinAmount || 0),
        Number(sessionData.bonusWinAmount || 0),
        updatedCommissionAmount,
      )

      const playerData = await Player.findOne({
        where: {
          player_name: playerName,
        },
        attributes: ['balance'],
        raw: true,
      })

      if (!playerData) throw new Error(`Player not found with player name: ${playerName}`)

      const currentBalance = playerData.balance || 0

      await redis.del(sessionId)

      io.to(socket.id).emit('update-balance', currentBalance + winAmount)

      io.to(socket.id).emit('cashout-balance', { winAmount, gameState: currentBet })

      const newBalance = currentBalance + winAmount

      await updatePlayerBalance(playerName, newBalance)
    } catch (error: any) {
      logger.error(`Error during cashout: ${error.message}`)
      io.to(socket.id).emit('error', { message: error.message })
    }
  })
}
