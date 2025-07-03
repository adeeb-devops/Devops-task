import { logger } from './logger'

export const creatingUserMapData = (mines: number, betAmount: number, bettedData: any): any => {
  try {
    const winningAmount: number = betAmount * 10

    if (!bettedData?.[mines]) {
      bettedData[mines] = {
        totalBetCount: 0,
        totalBettingAmount: 0,
        totalWinningAmount: 0,
      }
    }

    bettedData[mines].totalBettingAmount += betAmount
    bettedData[mines].totalWinningAmount += winningAmount
    bettedData[mines].totalBetCount++

    logger.info(`User map data: ${JSON.stringify(bettedData)}`)

    return bettedData
  } catch (error: any) {
    logger.error(`Error while creating map data: ${error.message}`)
    throw error
  }
}

export const creatingUser2xMapData = (bettedData: {
  [key: number | string]: { totalBetCount: number; totalBettingAmount: number; totalWinningAmount: number }
}): any => {
  try {
    for (const key in bettedData) {
      if (bettedData?.[key]) {
        bettedData[key].totalBettingAmount *= 2
        bettedData[key].totalWinningAmount *= 2
      }
    }

    logger.info(`User double map data: ${JSON.stringify(bettedData)}`)

    return bettedData
  } catch (error: any) {
    logger.error(`Error while creating map data: ${error.message}`)
    throw error
  }
}

export const creatingUserUndoMapData = (mines: number, betAmount: number, bettedData: any): any => {
  try {
    const winningAmount: number = betAmount * 10

    if (bettedData?.[mines]) {
      bettedData[mines].totalBettingAmount -= betAmount
      bettedData[mines].totalWinningAmount -= winningAmount
      bettedData[mines].totalBetCount--
    }

    logger.info(`User undo map data: ${JSON.stringify(bettedData)}`)

    return bettedData
  } catch (error: any) {
    logger.error(`Error while creating map data: ${error.message}`)
    throw error
  }
}

export const createAggregatedUsersMapData = (
  usersData: {
    player_name: string
    map_data: {
      [key: number | string]: { totalBetCount: number; totalBettingAmount: number; totalWinningAmount: number }
    }
    waitage_data: {
      user_waitage: number
      distributor_waitage: number
    }
  }[],
): {
  totalBetCount: number
  totalBettingAmount: number
  totalWinningAmount: number
  aggregatedMapData: Map<number, any>
} => {
  const aggregatedData = new Map<number, any>()
  const betAnalysis = {
    totalBetCount: 0,
    totalBettingAmount: 0,
    totalWinningAmount: 0,
  }

  try {
    for (const { player_name: playerName, map_data, waitage_data: waitageData } of usersData) {
      const { user_waitage: userWaitage, distributor_waitage: distributorWaitage } = waitageData
      for (const [key, data] of Object.entries(map_data)) {
        const num = Number(key)
        if (isNaN(num)) {
          logger.error(`Invalid key encountered: ${key}`)
          continue
        }

        const betInfo = aggregatedData.get(num) || {
          totalBetCount: 0,
          totalBettingAmount: 0,
          totalWinningAmount: 0,
          users: new Map<string, any>(),
        }

        betInfo.totalBetCount += data.totalBetCount
        betInfo.totalBettingAmount += data.totalBettingAmount
        betInfo.totalWinningAmount += data.totalWinningAmount

        betAnalysis.totalBetCount += data.totalBetCount
        betAnalysis.totalBettingAmount += data.totalBettingAmount
        betAnalysis.totalWinningAmount += data.totalWinningAmount

        const playerBetData = {
          ...data,
          user_waitage: userWaitage || 1,
          distributor_waitage: distributorWaitage || 1,
        }

        betInfo.users.set(playerName, playerBetData)

        aggregatedData.set(num, betInfo)
      }
    }
  } catch (error: any) {
    logger.error(`Error while creating aggregated users map data: ${error.message}`)
  }

  return {
    totalBetCount: betAnalysis.totalBetCount,
    totalBettingAmount: betAnalysis.totalBettingAmount,
    totalWinningAmount: betAnalysis.totalWinningAmount,
    aggregatedMapData: aggregatedData,
  }
}

export const creatingUserReBetRMapData = (betData: any[]): any => {
  try {
    if (!Array.isArray(betData) || betData.length == 0) throw new Error(`Bet data is missing`)

    const bettedData: any = {}

    betData.forEach(({ mines, bet_amount: betAmount }) => {
      if (!bettedData?.[mines]) {
        bettedData[mines] = {
          totalBetCount: 0,
          totalBettingAmount: 0,
          totalWinningAmount: 0,
        }
      }

      bettedData[mines].totalBettingAmount += betAmount
      bettedData[mines].totalWinningAmount += Number(betAmount) * 10
      bettedData[mines].totalBetCount++
    })

    logger.info(`User re bet map data: ${JSON.stringify(bettedData)}`)

    return bettedData
  } catch (error: any) {
    logger.error(`Error while creating map data: ${error.message}`)
    throw error
  }
}

export const calculateWinningNumber = (
  aggregatedMapData: Map<number, any>,
  totalBettingAmount: number,
  distributorProbabilities: { [key: string]: number },
  targetWinningAmountPercentage: number = 0.9,
): number | null => {
  let winningNumber: number | null = null
  let highestScore = -Infinity
  const targetWinningAmount = totalBettingAmount * targetWinningAmountPercentage

  for (const [number, betInfo] of aggregatedMapData) {
    let score = 0
    let potentialWinningAmount = 0

    for (const [data] of betInfo.users) {
      const distributor = data.distributor
      const distributorProbability = distributorProbabilities[distributor] || 1

      // New player bonus
      const newPlayerBonus = data.isNewPlayer ? 1.2 : 1 // Adjust the bonus as needed

      // Calculate weighted score
      score += (data.totalWinningAmount / totalBettingAmount) * distributorProbability * newPlayerBonus

      potentialWinningAmount += data.totalWinningAmount
    }

    // Ensure the winning amount is within the target range
    if (potentialWinningAmount <= targetWinningAmount && score > highestScore) {
      highestScore = score
      winningNumber = number
    }
  }

  return winningNumber
}
