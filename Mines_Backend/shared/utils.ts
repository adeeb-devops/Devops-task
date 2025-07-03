import { Op } from 'sequelize'
import bcrypt from 'bcrypt'
import { Game, DistributorLogs, AdminLogs, Distributor, Player, Template, GameCycle } from '../config'
import { logger } from './logger'
import { getEnv } from '../shared/env'
import { getRequest, postRequest } from './axiosCall'
import { Transaction } from '../config'
import { redis } from '../config/redis'
import { broadcastEndpoints } from './constant'
import { sequelize } from '../config/db'
import probabilityData from './diamondPossibility.json'

const env = getEnv()

export const generateRandomPassword = (): string => {
  return Math.random().toString(36).slice(-8)
}

/**
 * Generates a random 6-digit OTP.
 * @returns {string} The generated OTP.
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function getInitials(name: string): string {
  const parts = name.split(' ')
  const initials = parts.map((part) => part.charAt(0).toUpperCase()).join('')
  return initials
}

export const generateBetId = (playerName: string): string => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000).toString()
  return getInitials(playerName) + randomNumber
}

export const getContestHistory = async (templateId: number, limit: number = 15) => {
  try {
    const history = await Game.findAll({
      where: { template_id: templateId, win_number: { [Op.ne]: null } },
      attributes: ['win_number', 'multiplier'],
      order: [['created_at', 'DESC']],
      limit,
      raw: true,
    })

    return history
  } catch (error: any) {
    logger.error(`Error in history: ${error.message}`)
    throw new Error(error?.message)
  }
}

export const getPlayerWaitage = async (playerName: string) => {
  try {
    if (!playerName) {
      throw new Error('Player name is required')
    }

    const playerData = await getRequest(`${env?.qcBackendUrl}/player/waitage/${playerName}`)

    if (!playerData?.waitageData) throw new Error('Waitage data is missing')

    return JSON.stringify(playerData?.waitageData)
  } catch (error: any) {
    logger.error(`Error in player waitage: ${error.message}`)
    throw new Error(error)
  }
}

export const getGameWaitage = async (gameType: string = 'mines'): Promise<any> => {
  try {
    const gameData = await getRequest(`${env?.qcBackendUrl}/game/game/manipulation/${gameType}`)

    if (!gameData?.gameWeightageData) throw new Error('weightage data is missing')

    const gameWeightage = gameData?.gameWeightageData

    return {
      weightage: Number(gameWeightage?.weightage) || 0.95,
      cycle_count: Number(gameWeightage?.cycle_count) || 50,
    }
  } catch (error: any) {
    logger.error(`Error in player waitage: ${error.message}`)
    return {
      weightage: 0.95,
      cycle_count: 50,
    }
  }
}

export const broadcastData = async (data: any | any[]): Promise<void> => {
  try {
    const broadcastEndpointsArray = broadcastEndpoints
    await Promise.allSettled(broadcastEndpointsArray.map(async (endpoint) => await postRequest(endpoint, data)))
  } catch (error: any) {
    logger.error(`POST request failed to broadcast data: ${error?.response?.data?.message}`)
  }
}

export const saveContestData = async (
  gameState: any,
  gameType: string = 'manual',
  betAmount: number = 0.0,
  winAmount: number = 0.0,
  jackpotAmount: number = 0.0,
  commissionAmount: number = 0.0,
) => {
  try {
    const validGameTypes = ['manual', 'auto']

    logger.info(`Save Contest Data: - ${gameType}`)

    logger.info(
      `Save Contest Data: - bet amount: ${betAmount}, win amount: ${winAmount}, jackpot amount: ${jackpotAmount},  gameState: ${JSON.stringify(gameState)}`,
    )

    if (!gameState || Object.keys.length <= 0) {
      logger.error(`Invalid game state while saving the game data`)
      return null
    }

    const betId = gameState?.id
    const gameId = gameState?.gameId
    const bets: any[] = gameState?.state ? [gameState?.state] : []
    const isActive = gameState?.active
    const payoutMultiplier = gameState?.payout
    const isJackpot = gameState?.isJackpot

    logger.info(`Save Contest Data: - isActive: ${isActive}, payoutMultiplier: ${payoutMultiplier}`)

    if (!validGameTypes.includes(gameType)) {
      logger.error(`Invalid game type: ${gameType}. Allowed values are 'manual' and 'auto'.`)
      return null
    }

    if (!gameId) {
      logger.error(`Invalid game id in game state while saving the game data`)
      return null
    }

    const [existingContest, existingTransaction] = await Promise.all([
      Game.findOne({ where: { game_id: gameId, active: true } }) as any,
      Transaction.findOne({ where: { game_id: gameId } }) as any,
    ])

    if (!existingContest || !existingTransaction) {
      logger.error(`No active Game or transaction found with game id: ${gameId}`)
      return null
    }

    const currentBets = Array.isArray(existingContest.bets) ? existingContest.bets : []
    const updatedBets = [...currentBets, ...bets]

    const { totalTiles, minesCount } = gameState.state
    const updatedWinningAmount = existingContest?.winning_amount + winAmount
    logger.info(`Save Contest Data: - updatedWinningAmount: ${updatedWinningAmount}`)
    const updatedBetAmount = existingContest?.betting_amount + betAmount
    logger.info(`Save Contest Data: - updatedBetAmount: ${updatedBetAmount}`)
    const updatedCommissionAmount = existingTransaction?.commission_amount + commissionAmount
    logger.info(`Save Contest Data: - updatedCommissionAmount: ${updatedCommissionAmount}`)
    const closingBalance = existingTransaction.opening_balance - updatedBetAmount + updatedWinningAmount
    logger.info(`Save Contest Data: - closingBalance: ${closingBalance}`)
    const updatedJackpotAmount = existingContest?.jackpot_amount + jackpotAmount
    logger.info(`Save Contest Data: - updatedJackpotAmount: ${updatedJackpotAmount}`)

    const contestData = {
      bets: updatedBets,
      active: isActive,
      mines_count: minesCount,
      tiles_count: totalTiles,
      winning_amount: updatedWinningAmount,
      betting_amount: updatedBetAmount,
      game_type: gameType,
      jackpot_amount: updatedJackpotAmount,
      payout_multiplier: payoutMultiplier,
    }

    const transactionData = {
      betting_amount: updatedBetAmount,
      winning_amount: updatedWinningAmount,
      closing_balance: closingBalance,
      commission_amount: updatedCommissionAmount,
    }

    await Promise.all([existingContest.update(contestData), existingTransaction.update(transactionData)])
    logger.info(`Game updated: ${JSON.stringify(existingContest)}`)

    const participantData = [
      {
        player_name: gameState?.user?.name,
        user_name: gameState?.user?.userName,
        distributor_id: gameState?.user?.distributorId,
        is_auto_game: gameType == 'auto',
        transaction_type: 'bet-win',
        bet_amount: gameType == 'auto' ? betAmount : updatedBetAmount,
        winning_amount: gameType == 'auto' ? winAmount + jackpotAmount : updatedWinningAmount + updatedJackpotAmount,
        game_id: `${gameId}`,
        game_type: 'mines',
        bet_status: isActive ? 'active' : 'completed',
        start_time: gameState?.updatedAt,
        total_player: 1,
        all_bets: updatedBets,
        bet_id: betId,
        is_jackpot: gameState?.isJackpot || false,
        payout: gameState?.payout,
        mines_count: gameState?.state.minesCount,
        grid_type: `${Math.sqrt(totalTiles)} X ${Math.sqrt(totalTiles)}`,
        diamond: gameState?.state?.rounds?.length || 0,
      },
    ]

    logger.info(`Save Contest Data: - participantData: ${JSON.stringify(participantData)}`)

    try {
      logger.info(`Save Contest Data: - Player ${gameState?.user?.name}`)

      if (!isActive || isActive == 'false' || gameType == 'auto') {
        logger.info(`Save Contest Data: - Updating Game cycle data and Broadcasting Data`)

        const sessionBettedAmount = gameType == 'auto' ? betAmount : updatedBetAmount
        const sessionWinningAmount = gameType == 'auto' ? winAmount : updatedWinningAmount

        await Promise.all([
          updateGameCycleData(
            sessionBettedAmount,
            sessionWinningAmount + jackpotAmount,
            isJackpot,
            jackpotAmount > 0 ? true : false,
          ),
          broadcastData(participantData),
        ])
      }
    } catch (broadcastError: any) {
      logger.error(`Broadcast error: ${broadcastError.message}`)
    }

    return existingContest
  } catch (error: any) {
    logger.error(`Error saving game data: ${error.message}`)
    return null
  }
}

export const toggleGameStatus = async (gameId: string, isActive: boolean) => {
  try {
    const existingGame = await Game.findOne({ where: { game_id: gameId, active: true } })

    if (!existingGame) {
      logger.warn(`No active game found with gameId=${gameId}`)
      return null
    }

    await existingGame.update({ active: isActive })

    logger.info(`Game status updated: gameId=${gameId}, active=${isActive}`)
    return existingGame
  } catch (error: any) {
    logger.error(`Error updating game status for gameId=${gameId}: ${error.message}`)
    throw new Error('Failed to toggle game status.')
  }
}

export const adminLogs = async (username: string, action: string, ipaddress: string, lastLogin: any) => {
  await AdminLogs.create({
    actionName: action,
    username: username,
    ipaddress: ipaddress,
    last_login: lastLogin,
  })
}

export const distributorLogs = async (userData: any, action: string, ipaddress: string) => {
  await DistributorLogs.create({
    distributor_id: userData?.distributor_id,
    ipaddress: ipaddress,
    actionName: action,
    role: userData?.role,
    last_login: userData.last_login,
    parent_super_distributor: userData?.parent_super_distributor,
    parent_distributor: userData?.parent_distributor,
    parent_sub_distributor: userData?.parent_sub_distributor,
  })
}

export const createDistributorId = (name: string): string => {
  const firstWord = name.split(' ')[0].toLowerCase()

  const randomNumber = (Date.now() % 1000000).toString().padStart(6, '0')

  const uniqueId = `${firstWord}${randomNumber}`

  return uniqueId
}

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  return hashedPassword
}

export const comparePassword = async (inputPassword: string, userPassword: string): Promise<boolean> => {
  return await bcrypt.compare(inputPassword, userPassword)
}

export const getDistributorData = async (distributorId: string): Promise<any> => {
  try {
    const distributor: any = await Distributor.findOne({
      where: { distributor_id: distributorId },
      raw: true,
    })

    return distributor
  } catch (error) {
    throw new Error(`Error in get distributor with distributor id: ${(error as any).message}`)
  }
}

export const getPlayerBalance = async (playerName: string): Promise<any> => {
  try {
    const player: any = await Player.findOne({
      where: { player_name: playerName },
      raw: true,
    })

    return player
  } catch (error) {
    throw new Error(`Error in get distributor with distributor id: ${(error as any).message}`)
  }
}

export const updatePlayerBalance = async (playerName: string, newBalance: number): Promise<any> => {
  try {
    const [updatedRows] = await Player.update(
      { balance: newBalance },
      {
        where: { player_name: playerName },
        returning: true,
      },
    )

    if (updatedRows === 0) {
      throw new Error(`No player found with name: ${playerName}`)
    }

    return { balance: newBalance }
  } catch (error) {
    throw new Error(`Error updating player balance: ${(error as any).message}`)
  }
}

export const checkBalance = async (
  playerName: string,
  betAmount: number,
): Promise<{ isAllowed: boolean; balance: number }> => {
  try {
    const player = await Player.findOne({
      where: { player_name: playerName },
      attributes: ['balance'],
      raw: true,
    })

    if (!player) {
      throw new Error(`Player not found with player name: ${playerName}`)
    }

    const currentBalance = player.balance

    if (betAmount > currentBalance) {
      return { isAllowed: false, balance: currentBalance }
    }

    const updatedBalance = currentBalance - betAmount

    await Player.update({ balance: updatedBalance }, { where: { player_name: playerName } })

    //update redis

    logger.info(`Updated balance for ${playerName}: ${updatedBalance}`)

    return { isAllowed: true, balance: updatedBalance }
  } catch (error: any) {
    logger.error(`Error while checking balance for player ${playerName}: ${error.message}`)
    throw new Error(`Failed to check or update balance: ${error.message}`)
  }
}

export const checkPlayerStatus = async (playerName: string): Promise<{ valid: boolean; message?: string }> => {
  try {
    const player = await Player.findOne({
      where: { player_name: playerName },
      attributes: ['status'],
      raw: true,
    })

    if (!player) {
      throw new Error(`Player not found with player name: ${playerName}`)
    }

    if (player.status === 'inactive') {
      return { valid: false, message: 'Player is blocked' }
    }

    return { valid: true }
  } catch (error: any) {
    if (error.message === 'Player is blocked' || error.message === 'Player not found') {
      throw error
    }

    logger.error(`Error while checking player status for ${playerName}: ${error.message}`)
    throw new Error(`Failed to check player status: ${error.message}`)
  }
}

// Helper function for date ranges
export const getDateRanges = () => {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of this week
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1) // Start of this month
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1) // Start of last month
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0) // End of last month
  const threeMonthsStart = new Date(now.getFullYear(), now.getMonth() - 3, 1) // 3 months ago

  const last7DaysStart = new Date(todayStart)
  last7DaysStart.setDate(todayStart.getDate() - 7)

  return { todayStart, weekStart, monthStart, lastMonthStart, lastMonthEnd, threeMonthsStart, last7DaysStart }
}

export const getTemplateData = async (templateId: string) => {
  const redisKey = `mines-template-${templateId}`
  let redisTemplate = await redis.hgetall(redisKey)

  if (!redisTemplate || Object.keys(redisTemplate).length === 0) {
    const templateFromDb: any = await Template.findByPk(templateId)
    if (!templateFromDb) {
      throw new Error('Template not found.')
    }

    redisTemplate = {
      id: templateFromDb.id,
      grid_options: templateFromDb.grid_options,
      is_disabled: templateFromDb.is_disabled,
      jackpot_bonus: templateFromDb.jackpot_bonus,
      active: templateFromDb.active,
      rake_percentage: templateFromDb.rake_percentage,
      min_bet: templateFromDb.min_bet,
      max_bet: templateFromDb.max_bet,
    }

    await redis.hset(redisKey, redisTemplate)
  }

  return redisTemplate
}

export const getMaxAllowableWinningAmount = async (
  bettedAmount: number = 0,
  gameWinAmount: number = 0,
): Promise<number> => {
  try {
    let gameCycleData: any = await redis.hgetall('mines-game-cycle')

    if ((!gameCycleData || Object.keys(gameCycleData).length === 0) && gameCycleData.is_active != 'true') {
      logger.info(`No Game cycle data found`)
      let dbGameCycleData: any = await GameCycle.findOne({
        where: {
          is_active: true,
        },
        raw: true,
      })

      logger.info(`Active DB game cycle: ${JSON.stringify(dbGameCycleData)}`)

      if (!dbGameCycleData) {
        dbGameCycleData = await GameCycle.create({})

        dbGameCycleData = dbGameCycleData.get({ plain: true })
        logger.info(`New Game cycle created: ${JSON.stringify(dbGameCycleData)}`)
      }

      if (dbGameCycleData) {
        await redis.hset('mines-game-cycle', dbGameCycleData)
      } else {
        throw new Error('dbGameCycleData is null and cannot be set in Redis.')
      }

      gameCycleData = dbGameCycleData
    }

    logger.info(`GAME CYCLE DATA: ${JSON.stringify(gameCycleData)}`)

    if (bettedAmount <= 0) {
      logger.warn('No betted amount provided, skipping update.')
      return 0
    }

    let payoutMultiplier = 1
    const payoutPercentage = Number(gameCycleData?.payout_percentage) || 0.95

    const totalBettedAmount = Number(gameCycleData?.betted_amount) || 0 + bettedAmount
    const totalWinningAmount = Number(gameCycleData?.winning_amount) || 0 + gameWinAmount

    const currentPercentage = totalWinningAmount / totalBettedAmount

    logger.info(`Cuurent percentage of winning: ${currentPercentage * 100}%`)

    if (currentPercentage > payoutPercentage && currentPercentage <= payoutPercentage + 0.25) {
      payoutMultiplier = 1.5
    } else if (currentPercentage < payoutPercentage && currentPercentage > payoutPercentage - 0.25) {
      payoutMultiplier = 2
    } else if (currentPercentage <= payoutPercentage - 0.25) {
      payoutMultiplier = 20
    }

    logger.info(
      `Payout multiplier: ${payoutMultiplier}, Total betted amount: ${totalBettedAmount}, Total win amount: ${totalWinningAmount}`,
    )

    return payoutMultiplier * (Math.round(totalBettedAmount * payoutPercentage) - totalWinningAmount)
  } catch (error) {
    logger.error(`Error in getMaxAllowableWinningAmount: ${(error as any).message}`)
    return 0
  }
}

export const getGameCycleData = async (isJackpot: boolean): Promise<number> => {
  try {
    let redisKey = 'mines-game-cycle'

    if (isJackpot) redisKey = 'mines-jackpot-game-cycle'

    let gameCycleData: any = await redis.hgetall(redisKey)
    const whereCondition: any = {
      is_active: true,
    }

    if (isJackpot) whereCondition.is_jackpot = true

    if ((!gameCycleData || Object.keys(gameCycleData).length === 0) && gameCycleData.is_active != 'true') {
      logger.info(`No Game cycle data found`)
      let dbGameCycleData: any = await GameCycle.findOne({
        where: whereCondition,
        raw: true,
      })

      logger.info(`Active DB game cycle: ${JSON.stringify(dbGameCycleData)}`)

      if (!dbGameCycleData) {
        const creteObj: any = {}

        if (isJackpot) creteObj.is_jackpot = true

        dbGameCycleData = await GameCycle.create(creteObj)

        dbGameCycleData = dbGameCycleData.get({ plain: true })
        logger.info(`New Game cycle created: ${JSON.stringify(dbGameCycleData)}`)
      }

      await redis.hset(redisKey, dbGameCycleData)
      gameCycleData = dbGameCycleData
    }

    logger.info(`GAME CYCLE DATA: ${JSON.stringify(gameCycleData)}`)

    return gameCycleData
  } catch (error) {
    logger.error(`Error in getGameCycleData: ${(error as any).message}`)
    return 0
  }
}

export const updateGameCycleData = async (
  bettedAmount: number = 0,
  gameWinAmount: number = 0,
  isJackpot: boolean,
  isJackpotAppeared: boolean,
): Promise<void> => {
  try {
    let redisKey = 'mines-game-cycle'

    if (isJackpot) redisKey = 'mines-jackpot-game-cycle'
    logger.info(`Redis key: ${redisKey}`)
    let gameCycleData: any = await redis.hgetall(redisKey)

    logger.info(`Is jackpot appeared: ${isJackpotAppeared}`)

    if (!gameCycleData || Object.keys(gameCycleData).length === 0) {
      const whereCondition: any = {
        is_active: true,
      }

      if (isJackpot) whereCondition.is_jackpot = true

      let dbGameCycleData: any = await GameCycle.findOne({
        where: whereCondition,
        raw: true,
      })

      if (!dbGameCycleData) {
        const creteObj: any = {}

        if (isJackpot) creteObj.is_jackpot = true

        const newCycle = await GameCycle.create(creteObj)
        dbGameCycleData = newCycle.get({ plain: true })
      }

      await redis.hset(redisKey, dbGameCycleData)
      gameCycleData = dbGameCycleData
    }

    if (bettedAmount <= 0) {
      logger.warn('No betted amount provided, skipping update.')
      return
    }

    gameCycleData.current_cycle = Number(gameCycleData.current_cycle) + 1
    gameCycleData.betted_amount = (Number(gameCycleData.betted_amount) || 0) + Number(bettedAmount)
    gameCycleData.winning_amount = (Number(gameCycleData.winning_amount) || 0) + Number(gameWinAmount)

    logger.info(`Update Game Cycle Data:- current cycle: ${gameCycleData.current_cycle}`)

    if (isJackpotAppeared) {
      logger.info(`Creating new cycle`)

      await GameCycle.update(
        {
          is_active: false,
          current_cycle: gameCycleData.current_cycle,
          betted_amount: gameCycleData.betted_amount,
          winning_amount: gameCycleData.winning_amount,
          is_jackpot: true,
        },
        { where: { id: gameCycleData.id } },
      )

      const createObj: any = {}
      if (isJackpot) createObj.is_jackpot = true

      const newCycle = await GameCycle.create(createObj)

      gameCycleData = newCycle.get({ plain: true })
    } else {
      await GameCycle.update(
        {
          current_cycle: gameCycleData.current_cycle,
          betted_amount: gameCycleData.betted_amount,
          winning_amount: gameCycleData.winning_amount,
        },
        { where: { id: gameCycleData.id } },
      )
    }

    logger.info(`Updated Game Cycle Data: ${JSON.stringify(gameCycleData)}`)

    await redis.hset(redisKey, gameCycleData)

    return
  } catch (error) {
    // Log the error for debugging and monitoring
    logger.error(`Error in updateGameCycleData: ${(error as any).message}`, {
      stack: (error as any).stack,
    })
    return
  }
}

export const getPlayerPL = async (playerName: string): Promise<number> => {
  try {
    const playerPL = await Player.findOne({
      where: {
        player_name: playerName,
      },
      attributes: [
        'player_name',
        [
          sequelize.literal(`(
            SELECT SUM(betting_amount)
            FROM "games" AS games
            WHERE 
              games."player_name" = "Player"."player_name"
          )`),
          'total_betting_amount',
        ],
        [
          sequelize.literal(`(
            SELECT SUM(winning_amount)
            FROM "games" AS games
            WHERE 
              games."player_name" = "Player"."player_name"
          )`),
          'total_winning_amount',
        ],
      ],
      raw: true,
    })

    const totalBettingAmount = Number(playerPL?.total_betting_amount) || 0

    const totalWinningAmount = Number(playerPL?.total_winning_amount) || 0

    logger.info(
      `Player(${playerName}) PL data : total betting amount: ${totalBettingAmount}, total winning amount: ${totalWinningAmount}`,
    )

    const playerPLDifference = totalBettingAmount - totalWinningAmount

    logger.info(`Player(${playerName}) PL difference: ${playerPLDifference}`)

    return playerPLDifference
  } catch (error) {
    logger.error(`Error in get game cycle data for player ${playerName}: ${(error as any).message}`)
    return 0
  }
}

export const isDiamondCard = async (
  betAmount: number,
  payout: number,
  playerName: string,
  bonusAmount: number = 0,
  rounds: number = 100,
): Promise<boolean> => {
  try {
    const winAmount = betAmount * payout + bonusAmount

    logger.info(`Bet amount of the player (${playerName}): ${betAmount}`)
    logger.info(`Win amount of the player (${playerName}): ${winAmount}`)

    const maxAllowableWinningAmount = await getMaxAllowableWinningAmount(betAmount, 0)
    logger.info(`Maximum Allowable Winning Amount: ${maxAllowableWinningAmount}`)

    // Check if the win amount exceeds the maximum allowable winning amount
    if (winAmount > maxAllowableWinningAmount) {
      logger.info(`Win amount exceeds the maximum allowable limit for player ${playerName}.`)
      return false
    }

    // Get player's profit/loss (PL) percentage (0 to 100)
    const playerPLPercentage = await getPlayerPL(playerName)
    logger.info(`Player (${playerName}) PL difference: ${playerPLPercentage}`)

    // Define logic for determining isDiamond based on PL percentage
    let diamondChance = 0

    if (playerPLPercentage <= 40) {
      // Very low PL percentage, very high chance of being a diamond
      diamondChance = 100
    } else if (playerPLPercentage <= 70) {
      // Low PL percentage, moderate-high chance
      diamondChance = 75
    }
    // else if (playerPLPercentage <= 90) {
    //   // Mid PL percentage, moderate chance
    //   diamondChance = 40
    // }
    else {
      // High PL percentage, very low chance
      diamondChance = 50
    }

    if (rounds <= 2) diamondChance += 10

    logger.info(`Diamond chance for player (${playerName}): ${diamondChance}%`)

    // Determine if the player is a diamond based on the calculated chance
    const isDiamondResult = Math.random() * 100 < diamondChance
    logger.info(`Is Diamond result for player (${playerName}): ${isDiamondResult}`)

    return isDiamondResult
  } catch (error) {
    logger.error(`Error while checking is diamond or not: ${(error as any).message}`)
    return false
  }
}

export const isJackpotCard = async (isJackpot: boolean): Promise<boolean> => {
  try {
    const cycleData = await getGameCycleData(isJackpot)

    if (!cycleData || Object.keys(cycleData).length === 0) {
      logger.error('No game cycle data found')
      return false
    }

    const bettedAmount = Number((cycleData as any).betted_amount) || 0

    logger.info(`Betted amount while checking is jackpot or not: ${bettedAmount}`)

    if (bettedAmount <= 50000) {
      logger.info('Betted amount is less than or equal to 50000, not a jackpot card')
      return false
    }

    return Math.random() < 0.5 // 50% chance of being a jackpot card
  } catch (error) {
    logger.error(`Error while checking is jackpot or not: ${(error as any).message}`)
    return false
  }
}

export const isAllDiamondCard = async (minesAppeared: any, selectedTilesCount: number): Promise<boolean> => {
  try {
    const minesAppearedOn: string | number = String(minesAppeared)

    logger.info(`-------minesAppearedOn Auto Bet----- ${minesAppearedOn}`)

    if (!minesAppearedOn || minesAppearedOn == 'null' || minesAppearedOn == 'undefined') {
      logger.warn(`Invalid minesAppeared value: ${minesAppeared}`)
      return Math.random() < 0.5 // 50% chance of diamonds
    }

    const isDiamond = selectedTilesCount <= Number(minesAppearedOn)

    logger.info(
      `Auto Bet Check | Selected Tiles: ${selectedTilesCount}, Mines Appeared On: ${minesAppearedOn}, Result: ${isDiamond}`,
    )

    return isDiamond
  } catch (error) {
    logger.error(`Error in isAllDiamondCard: ${error instanceof Error ? error.message : error}`)
    return false
  }
}

export const minesAppearedOnTiles = async (minesCount: number, isJackpot: boolean): Promise<number> => {
  try {
    if (minesCount <= 0) {
      throw new Error('Invalid minesCount: must be greater than 0')
    }

    let generatedValue = 0
    let redisKey = `mines-diamond-possibility-5-grid-${minesCount}-mines`

    if (isJackpot) redisKey = `mines-jackpot-diamond-possibility-5-grid-${minesCount}-mines`

    let diamondProbabilityData: any
    diamondProbabilityData = await redis.hgetall(redisKey)

    if (
      !diamondProbabilityData ||
      Object.keys(diamondProbabilityData).length === 0 ||
      diamondProbabilityData.remaining_percentage <= 0
    ) {
      logger.info('No diamond possibility data found in Redis, fetching from JSON file')
      diamondProbabilityData = {
        remaining_percentage: 100,
        probability_json_data: JSON.stringify(
          probabilityData[minesCount.toString() as keyof typeof probabilityData] || [],
        ),
      }
    }

    let ranges
    try {
      ranges = JSON.parse(diamondProbabilityData.probability_json_data)
    } catch (jsonError) {
      logger.error(`JSON parsing error: ${(jsonError as Error).message}`)
      throw new Error('Failed to parse probability JSON data')
    }

    if (!Array.isArray(ranges) || ranges.length === 0) {
      logger.error(`No valid probability ranges found for minesCount: ${minesCount}`)
      throw new Error('Probability data is invalid or missing')
    }

    let remainingPercentage = Number(diamondProbabilityData.remaining_percentage) || 100

    const randomValue = Math.floor(Math.random() * remainingPercentage) + 1
    let cumulativeProbability = 0

    for (const entry of ranges) {
      if (!entry || typeof entry.chance !== 'number' || !entry.range) continue
      if (entry.chance <= 0) continue

      cumulativeProbability += entry.chance
      if (randomValue <= cumulativeProbability) {
        const rangeParts = entry.range.split(' to ').map(Number)
        if (rangeParts.length !== 2 || isNaN(rangeParts[0]) || isNaN(rangeParts[1])) {
          logger.error(`Invalid range format in probability data: ${entry.range}`)
          throw new Error('Invalid range format in probability data')
        }

        const [start, end] = rangeParts
        generatedValue = Math.floor(Math.random() * (end - start + 1)) + start
        remainingPercentage -= 1
        entry.chance -= 1
        break
      }
    }

    await redis.hset(redisKey, {
      remaining_percentage: remainingPercentage,
      probability_json_data: JSON.stringify(ranges),
    })

    logger.info(`Generated Random Value: ${generatedValue}`)
    return generatedValue
  } catch (error) {
    logger.error(`Error while generating mine appearance: ${(error as Error).message}`)
    return 0
  }
}

export const generateRandomMineLocations = (totalTiles: number, mines: number): number[] => {
  const mineLocations = new Set<number>([])

  while (mineLocations.size < mines) {
    const minePos = Math.floor(Math.random() * totalTiles) + 1
    if (!mineLocations.has(minePos)) {
      mineLocations.add(minePos)
    }
  }

  return Array.from(mineLocations)
}
