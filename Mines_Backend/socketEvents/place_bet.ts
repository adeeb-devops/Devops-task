import { Socket, Server } from 'socket.io'
import { logger } from '../shared/logger'
import { redis } from '../config/redis'
import {
  checkBalance,
  getTemplateData,
  checkPlayerStatus,
  // getMaxAllowableWinningAmount,
  minesAppearedOnTiles,
  generateRandomMineLocations,
  isJackpotCard,
  getPlayerPL,
} from '../shared/utils'
import { saveContestData } from '../shared/utils'

export const handlePlaceBet = (io: Server, socket: Socket) => {
  socket.on('placeBet', async (data) => {
    try {
      logger.info(`Bet received from client ${socket.id}: ${JSON.stringify(data)}`)
      const {
        id,
        player_name: playerName,
        mines,
        bet_amount: betAmount,
        tile_count: totalTiles,
        game_id: gameId,
        is_jackpot: isJackpot = false,
        template_id: templateId,
        user_name: userName,
        distributor_id: distributorId,
      } = data

      if (!playerName) {
        throw new Error('Invalid player information')
      }

      if (!templateId) {
        throw new Error('Invalid template information')
      }

      if (betAmount == null || betAmount < 0) throw new Error('Invalid bet amount')

      const redisTemplate = await getTemplateData(templateId)

      if (redisTemplate) {
        const minBet = Number(redisTemplate.min_bet)
        const maxBet = Number(redisTemplate.max_bet)

        if (betAmount < minBet || betAmount > maxBet) {
          throw new Error('Bet amount is out of allowed range.')
        }
      }

      if (!mines || mines <= 0) throw new Error('Invalid mines count')

      if (!totalTiles || totalTiles <= 0) throw new Error('Invalid total tiles count')
      if (!gameId) throw new Error('Missing game id')
      if (!id) throw new Error(`Id is missing`)

      const sessionId = `mines-${playerName}-${gameId}`

      const { isAllowed, balance } = await checkBalance(playerName, Number(betAmount))
      if (!isAllowed) {
        io.to(socket.id).emit('low-balance', { balance, message: 'Insufficient funds' })
        return
      }

      const playerStatus = await checkPlayerStatus(playerName)
      if (!playerStatus.valid) {
        socket.emit(
          'error',
          `An error occurred while processing your request. Please try again. --${playerStatus.message}`,
        )
        return
      }

      const sessionData = await redis.hgetall(sessionId)
      const betData = sessionData.betData ? JSON.parse(sessionData.betData) : []

      // await getMaxAllowableWinningAmount()

      const tilesId = `tiles-mines-${gameId}`

      let minesLocation

      let minesAppearedOn = null

      if (totalTiles == 25) {
        logger.info('-------Calculating the first mines tiles')
        minesAppearedOn = await minesAppearedOnTiles(mines, isJackpot)
        logger.info(`-------first mines tiles : ${minesAppearedOn}`)
      } else {
        minesLocation = generateRandomMineLocations(totalTiles, mines)
        await redis.hset(tilesId, { minesLocation: JSON.stringify(minesLocation) })
        await redis.expire(tilesId, 3600)
      }

      let isJackpotAppeared = 'no'
      let jackpotLocation = getRandomInt(totalTiles)

      if (isJackpot) {
        const playerPLDifference = (await getPlayerPL(playerName)) || 0
        if (playerPLDifference >= (Number(redisTemplate.jackpot_bonus) || 10000)) {
          isJackpotAppeared = (await isJackpotCard(isJackpot)) ? 'yes' : 'no'

          if (isJackpotAppeared === 'yes') {
            if (minesAppearedOn) {
              jackpotLocation = getRandomInt(minesAppearedOn)
              logger.info(`-------jackpot diamonds tiles : ${minesLocation}`)
            }
          }
        }
      }

      // Update game state for this player
      const gameState = {
        id,
        gameId: gameId,
        active: true,
        amount: betAmount,
        payout: 0,
        updatedAt: new Date().toISOString(),
        isJackpot,
        minesLocation,
        minesAppearedOn,
        isJackpotAppeared,
        jackpotLocation,
        user: {
          name: playerName,
          userName: userName,
          distributorId: distributorId,
        },
        state: {
          totalTiles: totalTiles,
          minesCount: mines,
          mines: [],
          jackpot: [],
          rounds: [],
        },
      }

      await saveContestData(gameState, 'manual', betAmount)

      betData.push(gameState)

      // Save updated session in Redis
      const redisFields = {
        playerName,
        totalBetAmount: Number(sessionData.totalBetAmount || 0) + betAmount,
        totalWinAmount: 0,
        bonusWinAmount: 0,
        betData: JSON.stringify(betData),
      }

      await redis.hset(sessionId, redisFields)

      io.to(socket.id).emit('update-balance', balance)
      io.to(socket.id).emit('bet-placed', gameState)

      logger.info(`Bet placed successfully by ${playerName}: ${JSON.stringify(gameState)}`)
    } catch (error: any) {
      logger.error(`Error while creating the bet: ${error.message}`)
      io.to(socket.id).emit('error', error.message)
    }
  })
}

export const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * max) + 1
}
