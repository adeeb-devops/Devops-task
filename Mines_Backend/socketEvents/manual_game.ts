import { Server, Socket } from 'socket.io'
import { logger } from '../shared/logger'
import { redis } from '../config/redis'
import manualPayoutData from '../shared/payout.json'
import jackpotPayoutData from '../shared/jackpotPayout.json'
import { Player } from '../config/index'
import {
  getTemplateData,
  isJackpotCard,
  // isDiamondCard,
  minesAppearedOnTiles,
  saveContestData,
  updatePlayerBalance,
} from '../shared/utils'

const INVALID_REQUEST_ERROR = 'Invalid request data'

// Type Definitions
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
  id: number
  game_id: string
  active: boolean
  state: BetState
  payoutMultiplier: string
  payout: number
  amount: number
  updatedAt: string
  minesAppearedOn?: number
  isJackpotAppeared?: string
  jackpotLocation?: number
}

// Helper Functions
const getPayoutMultiplier = (
  minesCount: string,
  diamondsCount: number,
  totalTiles: number,
  isJackpot: boolean,
): number => {
  let payoutData = (manualPayoutData as any).payouts[totalTiles.toString()]
  if (!payoutData) throw new Error(`Unsupported board size with ${totalTiles} tiles.`)

  if (isJackpot) {
    payoutData = (jackpotPayoutData as any).payouts[totalTiles.toString()]
    if (!payoutData) throw new Error(`Unsupported jackpot board size with ${totalTiles} tiles.`)
  }

  const mineData = payoutData[minesCount]
  if (!mineData) throw new Error(`Invalid mine count: ${minesCount}`)

  const diamondsKey = diamondsCount.toString()
  if (!(diamondsKey in mineData)) throw new Error(`Invalid number of diamonds: ${diamondsCount}`)

  const payout = mineData[diamondsKey]
  if (!payout) throw new Error(`Invalid payout value for diamonds: ${diamondsCount}`)

  return payout
}

const generateMineLocations = (
  totalTiles: number,
  openedFields: number[],
  targetMines: number,
  initialField: number[],
): number[] => {
  const mineLocations = new Set<number>(initialField)

  logger.warn(`OPENED TILES: ${JSON.stringify(openedFields)}`)

  while (mineLocations.size < targetMines) {
    const minePos = Math.floor(Math.random() * totalTiles) + 1
    if (!openedFields.includes(minePos) && !mineLocations.has(minePos)) {
      mineLocations.add(minePos)
    }
  }

  return Array.from(mineLocations)
}

// Main Handler
export const handleOpenSingleTile = (io: Server, socket: Socket) => {
  socket.on('open-single-tile', async (data) => {
    try {
      logger.info(`Tile opened by ${socket.id}: ${JSON.stringify(data)}`)

      const {
        player_name: playerName,
        game_id: gameId,
        field,
        is_jackpot: isJackpot = false,
        template_id: templateId,
      } = data
      if (!gameId || !field || !playerName) throw new Error(INVALID_REQUEST_ERROR)

      const sessionId = `mines-${playerName}-${gameId}`
      const sessionData: any = await redis.hgetall(sessionId)
      if (!sessionData || !sessionData.betData) throw new Error('Game session not found.')

      const betData: Bet[] = JSON.parse(sessionData.betData)
      if (!betData.length) throw new Error('Bet data is empty.')

      const currentBet = betData[betData.length - 1]
      if (!currentBet.active) throw new Error('Invalid or inactive bet.')

      const { rounds, minesCount, totalTiles, jackpot } = currentBet.state
      if (rounds.some((round) => round.field === field)) throw new Error('Tile already opened.')

      const templateData = await getTemplateData(templateId)

      const rakePercentage = (Number(templateData?.rake_percentage) || 0) / 100 || 0

      const newMultiplier = getPayoutMultiplier(minesCount.toString(), rounds.length + 1, totalTiles, isJackpot)

      const bonusAmount = Number(templateData.jackpot_bonus) || 0

      //=========================================================================================================

      //RANDOM MINES CODE HERE

      const tilesId = `tiles-mines-${gameId}`

      const minesData: any = await redis.hgetall(tilesId)

      let isRandom = true

      if (!minesData || !minesData.minesLocation) {
        isRandom = false
      } else {
        try {
          const minesLocation = JSON.parse(minesData.minesLocation)
          if (!Array.isArray(minesLocation) || minesLocation.length === 0) {
            isRandom = false
          }
        } catch (error) {
          logger.error(`Error parsing minesLocation JSON: ${error}`)
          isRandom = false
        }
      }

      logger.info(`-------isRandom----- ${isRandom}`)

      logger.info(`-------minesLocation----- ${JSON.stringify(minesData.minesLocation)}`)

      // const isDiamond = Math.random() < DIAMOND_PROBABILITY

      let isDiamond = false

      // const isJackpotDiamond = await isDiamondCard(currentBet.amount, newMultiplier, playerName, bonusAmount)

      //======================================================================================================

      logger.info(`-------totalTiles----- ${totalTiles}`)
      const isPossibility = totalTiles == 25

      logger.info(`-------isPossibility----- ${isPossibility}`)

      if (isPossibility) {
        let minesAppearedOn: string | number = String(currentBet.minesAppearedOn)

        logger.info(`-------minesAppearedOn----- ${minesAppearedOn}`)

        if (!minesAppearedOn || minesAppearedOn == 'null' || minesAppearedOn == 'undefined') {
          logger.info(`-------minesAppearedOn Setting----- ${minesAppearedOn}`)
          minesAppearedOn = await minesAppearedOnTiles(minesCount, isJackpot)
        }

        logger.info(`-------minesAppearedOn AFTER----- ${minesAppearedOn}`)

        if (rounds.length < Number(minesAppearedOn)) {
          isDiamond = true
        }
      } else {
        if (isRandom) {
          const mineLocations = new Set<number>(minesData.minesLocation)

          if (!mineLocations.has(field)) {
            isDiamond = true
          }
        } else {
          isDiamond = Math.random() < 0.7
        }
      }

      let isJackpotDiamond = false

      if (isJackpot && isDiamond) {
        const jackpotAppeared = currentBet?.isJackpotAppeared

        if (!jackpotAppeared) {
          // Only check for jackpot card if it hasn't appeared yet
          isJackpotDiamond = await isJackpotCard(isJackpot)
          logger.info(`Jackpot appeared missing ${jackpotAppeared} | Calculating again: ${isJackpotDiamond}`)

          if (isJackpotDiamond) {
            currentBet.isJackpotAppeared = 'yes'
            currentBet.jackpotLocation = rounds.length + 1
            logger.info(`Jackpot appeared ${jackpotAppeared} | jackpotLocation: ${currentBet.jackpotLocation}`)

            isDiamond = false
          }
        } else if (jackpotAppeared === 'yes') {
          isJackpotDiamond = true
          const jackpotLocation = currentBet?.jackpotLocation
          logger.info(
            `Jackpot appeared ${jackpotAppeared} | jackpotLocation: ${jackpotLocation}, rounds length: ${rounds.length + 1}`,
          )
          if (rounds.length + 1 == jackpotLocation) {
            isDiamond = false
          }
        }
      }

      const lastDiamond = Number(totalTiles) - Number(minesCount) - 1
      const isLastDiamond = rounds?.length === lastDiamond

      if (isDiamond) {
        rounds.push({ field, payoutMultiplier: newMultiplier })
        currentBet.payout = newMultiplier
        currentBet.updatedAt = new Date().toISOString()

        if (isLastDiamond) {
          if (isJackpot && jackpot?.length == 0) {
            currentBet.state?.jackpot?.push(field)

            sessionData.bonusWinAmount = bonusAmount
          }

          currentBet.state.rounds = rounds

          const mineLocations = generateMineLocations(
            totalTiles,
            rounds.map((round) => round.field),
            minesCount,
            [],
          )

          currentBet.state.mines = mineLocations

          io.to(socket.id).emit('game-over', { message: 'Last Diamond Opened', gameState: currentBet })

          let winAmount = await gameOver(currentBet, rakePercentage, sessionData)

          winAmount += Number(bonusAmount)

          const playerData = await Player.findOne({
            where: {
              player_name: playerName,
            },
            attributes: ['balance'],
            raw: true,
          })

          if (!playerData) throw new Error(`Player not found with player name: ${playerName}`)

          const currentBalance = playerData.balance || 0

          io.to(socket.id).emit('update-balance', currentBalance + winAmount)

          const newBalance = currentBalance + winAmount

          await updatePlayerBalance(playerName, newBalance)

          await redis.del(sessionId)
        } else {
          const redisFields = {
            playerName,
            totalBetAmount: Number(sessionData.totalBetAmount),
            totalWinAmount: Number(sessionData.totalWinAmount || 0),
            bonusWinAmount: Number(sessionData.bonusWinAmount || 0),
            betData: JSON.stringify(betData),
          }

          await redis.hset(sessionId, redisFields)

          io.to(socket.id).emit('tile-opened', {
            data: { gameState: currentBet },
          })
        }
      } else if (isJackpot && isJackpotDiamond && currentBet.state?.jackpot && currentBet.state?.jackpot?.length < 1) {
        rounds.push({ field, payoutMultiplier: newMultiplier })
        currentBet.payout = newMultiplier
        currentBet.updatedAt = new Date().toISOString()

        currentBet.state?.jackpot?.push(field)

        currentBet.isJackpotAppeared = 'no'

        const redisFields = {
          playerName,
          totalBetAmount: Number(sessionData.totalBetAmount),
          totalWinAmount: Number(sessionData.totalWinAmount || 0),
          bonusWinAmount: Number(sessionData.bonusWinAmount || 0) + bonusAmount,
          betData: JSON.stringify(betData),
        }

        await redis.hset(sessionId, redisFields)

        const playerData = await Player.findOne({
          where: {
            player_name: playerName,
          },
          attributes: ['balance'],
          raw: true,
        })

        if (!playerData) throw new Error(`Player not found with player name: ${playerName}`)

        let currentBalance = playerData.balance || 0

        if (isLastDiamond) {
          const mineLocations = generateMineLocations(
            totalTiles,
            rounds.map((round) => round.field),
            minesCount,
            [],
          )

          currentBet.state.mines = mineLocations

          io.to(socket.id).emit('game-over', { message: 'Last Diamond Opened', gameState: currentBet })

          const winAmount = await gameOver(currentBet, rakePercentage, sessionData)

          currentBalance += winAmount
        } else {
          io.to(socket.id).emit('tile-opened', {
            message: 'Hurray!! Jackpot here',
            data: { gameState: currentBet },
          })
        }

        io.to(socket.id).emit('update-balance', currentBalance + bonusAmount)

        const newBalance = currentBalance + bonusAmount

        await updatePlayerBalance(playerName, newBalance)
      } else {
        currentBet.active = false
        currentBet.payout = 0

        const mineLocations = generateMineLocations(
          totalTiles,
          rounds.map((round) => round.field),
          minesCount,
          [field],
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

        await saveContestData(
          currentBet,
          'manual',
          0,
          Number(sessionData.bonusWinAmount || 0),
          Number(sessionData.bonusWinAmount || 0),
        )

        await redis.del(sessionId)

        io.to(socket.id).emit('game-over', { message: 'You hit a mine!', gameState: currentBet })
      }

      logger.info(`Tile ${field} opened by ${playerName}. Result: ${isDiamond ? 'Diamond' : 'Mine'}`)
    } catch (error: any) {
      logger.error(`Error opening tile: ${error.message}`)
      io.to(socket.id).emit('error', { message: error.message })
    }
  })
}

const gameOver = async (currentBet: any, rakePercentage: number, sessionData: any): Promise<number> => {
  let winAmount = Number(currentBet.amount) * Number(currentBet.payout)

  const winningMinusBetting = winAmount - Number(currentBet.amount)
  const updatedCommissionAmount = winningMinusBetting > 0 && rakePercentage ? winningMinusBetting * rakePercentage : 0

  winAmount -= updatedCommissionAmount

  await saveContestData(
    currentBet,
    'manual',
    0,
    winAmount + Number(sessionData.bonusWinAmount || 0),
    Number(sessionData.bonusWinAmount || 0),
    updatedCommissionAmount,
  )

  return winAmount || 0
}
