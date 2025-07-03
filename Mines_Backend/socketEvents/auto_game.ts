import { Server, Socket } from 'socket.io'
import { logger } from '../shared/logger'
import { redis } from '../config/redis'
import manualPayoutData from '../shared/payout.json'
import jackpotPayoutData from '../shared/jackpotPayout.json'
import {
  getTemplateData,
  // isDiamondCard,
  minesAppearedOnTiles,
  saveContestData,
  toggleGameStatus,
  updatePlayerBalance,
  isAllDiamondCard,
  isJackpotCard,
  getPlayerPL,
} from '../shared/utils'
import { checkBalance, checkPlayerStatus } from '../shared/utils'
import { Game } from '../config/index'

// Constants
// const selectedTileMineProbability = 0.1

const autoBetSessions: Record<string, { stopRequested: boolean }> = {}

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

const generateMineLocations = (totalTiles: number, selectedTiles: number[], minesCount: number, isWin: boolean) => {
  logger.info(`------totalTiles----${totalTiles}`)
  logger.info(`------minesCount----${minesCount}`)
  logger.info(`------isWin----${isWin}`)
  const mineLocations: Set<number> = new Set()
  const allTiles = Array.from({ length: totalTiles }, (_, i) => i + 1)

  logger.info(`------allTiles----${JSON.stringify(allTiles)}`)

  const nonSelectedTiles = allTiles.filter((tile) => !selectedTiles.includes(tile))

  logger.info(`------selectedTiles----${JSON.stringify(selectedTiles)}`)
  logger.info(`------nonSelectedTiles---- ${JSON.stringify(nonSelectedTiles)}`)

  let isMineHit = false
  while (mineLocations.size < minesCount) {
    let isFromSelected = !isWin

    if (!isMineHit) {
      if (isFromSelected) {
        const randomIndex = Math.floor(Math.random() * selectedTiles.length)
        const tile = selectedTiles[randomIndex]
        mineLocations.add(tile)
        selectedTiles.splice(randomIndex, 1)
      }

      isMineHit = isFromSelected
    }

    if (!isMineHit && !isWin && !isFromSelected && minesCount - mineLocations.size == 1) {
      logger.info('-----last mine------')
      isFromSelected = true
    }

    let availableTiles = []

    if (isMineHit) {
      availableTiles = [...selectedTiles, ...nonSelectedTiles]
    } else {
      availableTiles = isFromSelected ? selectedTiles : nonSelectedTiles
    }

    logger.info(`-----availableTiles------${JSON.stringify(availableTiles)}`)

    if (availableTiles.length === 0) {
      availableTiles = isFromSelected ? nonSelectedTiles : selectedTiles

      logger.info(`-----inner availableTiles------${JSON.stringify(availableTiles)}`)

      if (availableTiles.length === 0) {
        logger.warn('-----Exceptional Case breaking the loop------')
        break
      }
    }

    const randomTileIndex = Math.floor(Math.random() * availableTiles.length)
    const tile = availableTiles[randomTileIndex]

    if (!mineLocations.has(tile)) {
      if (mineLocations.size < minesCount) mineLocations.add(tile)
    }

    availableTiles.splice(randomTileIndex, 1)
  }

  return Array.from(mineLocations)
}

export const handleAutoBet = (io: Server, socket: Socket) => {
  const sessionTimeouts: Record<string, NodeJS.Timeout> = {}

  socket.on('auto-bet', async (data) => {
    try {
      logger.info(`Auto-bet received from client ${socket.id}: ${JSON.stringify(data)}`)

      const {
        id,
        player_name: playerName,
        mines,
        bet_amount: betAmount,
        tile_count: totalTiles,
        game_id: gameId,
        numberOfBets,
        tileSelections,
        is_infinite: isInfinite = true,
        is_jackpot: isJackpot = false,
        profitLimit,
        lossLimit,
        template_id: templateId,
        user_name: userName,
        distributor_id: distributorId,
      } = data

      if (!playerName) throw new Error('Missing player name')
      if (!gameId) throw new Error('Missing game ID')
      if (!id) throw new Error(`Id is missing.`)
      if (!mines || mines <= 0) throw new Error('Invalid mines count')
      if (betAmount == null || betAmount < 0) throw new Error('Invalid bet amount')
      if (!totalTiles || totalTiles < 0) throw new Error('Invalid total tiles count')
      if (!Array.isArray(tileSelections) || tileSelections.length <= 0)
        throw new Error('Invalid or mismatched tile selections for the number of bets')

      if (isInfinite) {
        if (numberOfBets) {
          throw new Error('numberOfBets should not be provided when is_infinite is true')
        }
      } else {
        if (!numberOfBets || numberOfBets == null || numberOfBets <= 0) {
          throw new Error('Invalid or missing numberOfBets for finite bets')
        }
      }

      const templateData: any = await getTemplateData(templateId)

      if (templateData) {
        const minBet = Number(templateData.min_bet)
        const maxBet = Number(templateData.max_bet)

        if (betAmount < minBet || betAmount > maxBet) {
          throw new Error('Bet amount is out of allowed range.')
        }
      }

      const [playerStatus, activeGame] = await Promise.all([
        checkPlayerStatus(playerName),
        Game.findOne({
          where: {
            player_name: playerName,
            game_id: gameId,
            active: true,
          },
        }),
      ])

      if (!activeGame) {
        throw new Error(`No active auto game found for player: ${playerName}, game ID: ${gameId}`)
      }

      if (!playerStatus.valid) {
        socket.emit(
          'error',
          `An error occurred while processing your request. Please try again. --${playerStatus.message}`,
        )
        return
      }

      const bonusAmount = Number(templateData.jackpot_bonus) || 0

      const rakePercentage = templateData?.rake_percentage / 100 || 0

      const sessionId = `mines-${playerName}-${gameId}`
      autoBetSessions[sessionId] = { stopRequested: false }

      let JackpotEligibility = false

      if (isJackpot) {
        const playerPLDifference = await getPlayerPL(playerName)

        if (playerPLDifference >= (Number(templateData.jackpot_bonus) || 10000)) {
          JackpotEligibility = true

          logger.info(`Player ${playerName} is eligible for jackpot`)
        }
      }

      socket.on('disconnect', async () => {
        if (autoBetSessions[sessionId]) {
          autoBetSessions[sessionId].stopRequested = true
          logger.info(`User disconnected. Stopping auto-bet session: ${sessionId}`)

          if (sessionTimeouts[sessionId]) {
            clearTimeout(sessionTimeouts[sessionId])
            delete sessionTimeouts[sessionId]
          }

          await Promise.all([toggleGameStatus(gameId, false), redis.del(sessionId)])
          delete autoBetSessions[sessionId]

          return
        }
      })

      const processBet = async (betIndex: number) => {
        const results: any = []
        const sessionData = await redis.hgetall(sessionId)
        const totalBetAmount = Number(sessionData.totalBetAmount || 0)
        const totalWinningAmount = Number(sessionData.totalWinningAmount || 0)
        let bonusWinAmount = 0

        // Calculate profit or loss
        const profitOrLoss = totalWinningAmount - totalBetAmount

        // Check if max bet limit is reached
        if (betAmount > Number(templateData.max_bet)) {
          io.to(socket.id).emit('auto-bet-stopped', {
            message: `Auto-bet stopped due to maximum bet amount limit reached`,
            results,
          })

          if (betIndex != 0) {
            await toggleGameStatus(gameId, false)
            await redis.del(sessionId)

            delete autoBetSessions[sessionId]
          }

          return
        }

        // Check if profit or loss limit is reached
        if ((profitLimit && profitOrLoss >= profitLimit) || (lossLimit && -profitOrLoss >= lossLimit)) {
          io.to(socket.id).emit('auto-bet-stopped', {
            message: `Auto-bet stopped due to ${profitOrLoss >= profitLimit ? 'profit' : 'loss'} limit reached`,
            results,
          })

          if (betIndex != 0) {
            await toggleGameStatus(gameId, false)
            await redis.del(sessionId)

            delete autoBetSessions[sessionId]
          }

          return
        }

        if (autoBetSessions[sessionId]?.stopRequested) {
          io.to(socket.id).emit('auto-bet-stopped', {
            message: 'Auto-bet stopped by user',
            results,
          })

          if (betIndex != 0) {
            await toggleGameStatus(gameId, false)
            await redis.del(sessionId)
            delete autoBetSessions[sessionId]
          }

          return
        }

        // Check balance for bet amount
        const { isAllowed, balance } = await checkBalance(playerName, betAmount)
        if (!isAllowed) {
          io.to(socket.id).emit('low-balance', { balance, message: 'Insufficient funds for auto-bet' })

          if (betIndex != 0) {
            await toggleGameStatus(gameId, false)
            await redis.del(sessionId)
            delete autoBetSessions[sessionId]
          }

          return
        }

        let minesAppearedOn = null

        if (totalTiles == 25) {
          logger.info('-------Calculating the first mines tiles for auto-bet')
          minesAppearedOn = await minesAppearedOnTiles(mines, isJackpot)
          logger.info(`-------Minescount: ${mines} | first mines tiles : ${minesAppearedOn}`)
        }

        let currentBalance = balance

        io.to(socket.id).emit('update-balance', currentBalance)

        const isLastRound = !isInfinite && betIndex === numberOfBets - 1

        const { state, payOut, isJackpotHit } = await calculatePayout(
          // playerName,
          tileSelections,
          mines,
          totalTiles,
          isJackpot,
          // totalBetAmount,
          // bonusAmount,
          minesAppearedOn,
          JackpotEligibility,
        )
        state.selectedTiles = tileSelections

        let winningAmount = payOut * betAmount

        const gameState = {
          id,
          gameId: gameId,
          active: !isLastRound,
          amount: betAmount,
          payout: payOut,
          updatedAt: new Date().toISOString(),
          isJackpot,
          user: {
            name: playerName,
            userName: userName,
            distributorId: distributorId,
          },
          state: state,
        }

        if (isJackpotHit) {
          bonusWinAmount = bonusAmount

          currentBalance += bonusAmount

          io.to(socket.id).emit('update-balance', currentBalance)

          await updatePlayerBalance(playerName, currentBalance)
        }

        await redis.hset(sessionId, {
          playerName,
          totalBetAmount: Number(sessionData.totalBetAmount || 0) + betAmount,
          totalWinningAmount: Number(sessionData.totalWinningAmount || 0) + winningAmount,
          bonusWinAmount: Number(sessionData.bonusWinAmount || 0) + bonusWinAmount,
          betData: JSON.stringify([gameState]),
        })

        const winningMinusBetting = winningAmount - betAmount
        const updatedCommissionAmount =
          winningMinusBetting > 0 && rakePercentage ? winningMinusBetting * rakePercentage : 0

        logger.info(
          `Updated commission amount: ${updatedCommissionAmount}, winning minus betting: ${winningMinusBetting}, rake percentage: ${rakePercentage}`,
        )

        winningAmount -= updatedCommissionAmount

        if (winningAmount < 0) {
          logger.warn(`Winning amount is negative: ${winningAmount}`)
          winningAmount = 0
        }

        currentBalance += winningAmount

        logger.info(`Updated balance after winning: ${currentBalance}`)

        io.to(socket.id).emit('update-balance', currentBalance)

        io.to(socket.id).emit('auto-bet-progress', gameState)

        await Promise.all([
          saveContestData(gameState, 'auto', betAmount, winningAmount + bonusWinAmount, bonusWinAmount),

          await updatePlayerBalance(playerName, currentBalance),
        ])

        results.push(gameState)

        if (!isLastRound && !autoBetSessions[sessionId]?.stopRequested) {
          sessionTimeouts[sessionId] = setTimeout(() => processBet(betIndex + 1), 2000)
        } else {
          setTimeout(() => {
            io.to(socket.id).emit('auto-bet-complete', {
              message: `Auto-bet complete for ${numberOfBets} bets`,
              results,
            })
          }, 3000)

          return
        }
      }

      // Start the first bet
      processBet(0)
    } catch (error: any) {
      logger.error(`Error opening tile: ${error.message}`)
      io.to(socket.id).emit('error', { message: error.message })
    }
  })

  // stop auto-bet event
  socket.on('stop-auto-bet', (data) => {
    const { player_name: playerName, game_id: gameId } = data
    const sessionId = `mines-${playerName}-${gameId}`

    if (autoBetSessions[sessionId]) {
      autoBetSessions[sessionId].stopRequested = true // Set stop flag
      logger.info(`Stop requested for auto-bet session: ${sessionId}`)
      io.to(socket.id).emit('stop-auto-bet-confirmation', { message: 'Auto-bet stop request acknowledged' })
    } else {
      io.to(socket.id).emit('error', { message: 'No active auto-bet session found for this game and player' })
    }
  })
}

const calculatePayout = async (
  // playerName: string,
  selectedTiles: number[],
  minesCount: number,
  totalTiles: number,
  isJackpot: boolean,
  // betAmt: number,
  // bonusAmt: number = 0,
  minesAppearedOn: any,
  JackpotEligibility: boolean = false,
): Promise<{ state: any; payOut: number; isJackpotHit: boolean }> => {
  const rounds: { field: number; payoutMultiplier: number }[] = []
  // const lastDiamondMultiplier = getPayoutMultiplier(minesCount.toString(), selectedTiles.length, totalTiles, isJackpot)
  const isWin = await isAllDiamondCard(minesAppearedOn, selectedTiles.length)
  const mineLocations = generateMineLocations(totalTiles, [...selectedTiles], minesCount, isWin)
  const jackpot: number[] = []
  const mineLocationsSet = new Set(mineLocations)
  const selectedTilesSet = new Set(selectedTiles)

  let minedTile = null
  let isJackpotHit = false

  if (isJackpot) {
    const nonMineTiles = Array.from({ length: totalTiles }, (_, i) => i + 1).filter(
      (tile) => !mineLocationsSet.has(tile),
    )
    const selectedNonMineTiles = selectedTiles.filter((tile) => !mineLocationsSet.has(tile))
    const otherNonMineTiles = nonMineTiles.filter((tile) => !selectedTilesSet.has(tile))

    const isJackpotDiamond = (await isJackpotCard(isJackpot)) && JackpotEligibility //await isDiamondCard(betAmt, 0, playerName, bonusAmt)

    logger.info(`isJackpotDiamond: ${isJackpotDiamond}`)

    if (isJackpotDiamond && selectedNonMineTiles.length > 0) {
      isJackpotHit = true
      jackpot.push(selectedNonMineTiles[Math.floor(Math.random() * selectedNonMineTiles.length)])
    } else if (otherNonMineTiles.length > 0) {
      jackpot.push(otherNonMineTiles[Math.floor(Math.random() * otherNonMineTiles.length)])
    }

    if (jackpot.length > 0) {
      logger.info(`Jackpot tile at: ${jackpot[0]}`)
    } else {
      logger.warn(`Missing Jackpot tile.`)
    }
  }

  for (let i = 0; i < selectedTiles.length; i++) {
    const tile = selectedTiles[i]

    if (mineLocationsSet.has(tile)) {
      minedTile = tile
      rounds.push({ field: tile, payoutMultiplier: 0 })
      break
    }

    const payoutMultiplier = getPayoutMultiplier(minesCount.toString(), i + 1, totalTiles, isJackpot)
    rounds.push({ field: tile, payoutMultiplier })
  }

  if (minedTile != null) {
    return {
      state: {
        totalTiles,
        minesCount,
        mines: mineLocations,
        jackpot,
        rounds,
      },
      payOut: 0,
      isJackpotHit,
    }
  }

  const payout = rounds.length > 0 ? rounds[rounds.length - 1].payoutMultiplier : 0

  return {
    state: {
      totalTiles,
      minesCount,
      mines: mineLocations,
      jackpot,
      rounds,
    },
    payOut: payout,
    isJackpotHit,
  }
}
