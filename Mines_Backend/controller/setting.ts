import { Response } from 'express'
import { Request } from '../interfaces/generic'
import { logger } from '../shared/logger'
import manualPayoutData from '../shared/payout.json'
import jackpotPayoutData from '../shared/jackpotPayout.json'

export const getPayouts = (gameType: string = 'manual') => {
  let payoutData

  if (gameType == 'manual') {
    payoutData = (manualPayoutData as any).payouts
  }

  if (gameType == 'jackpot') {
    payoutData = (jackpotPayoutData as any).payouts
  }

  return payoutData
}

const controller = {
  payOuts: async (_req: Request, res: Response): Promise<void | Response> => {
    try {
      const payout = getPayouts()
      res.status(200).json({ data: payout })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({ success: false, message: e?.message || 'Something went wrong' })
    }
  },
}

export default controller
