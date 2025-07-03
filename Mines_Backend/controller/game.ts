import { Response } from 'express'
import { Op, Sequelize } from 'sequelize'
import { Request } from '../interfaces/generic'
import { logger } from '../shared/logger'
import { Game, GameCycle, Player, Template, Transaction } from '../config/index'

const controller = {
  getGameDetails: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const {
        limit,
        offset,
        playerId,
        playerName,
        playerType,
        phoneNumber,
        betType,
        gameId,
        noOfMines,
        clientName,
        betId,
        isJackpot,
        payoutMultiplier,
        gridType,
        minesType,
        transactionType,
        gameName,
        startDate,
        endDate,
      } = req.query
      const whereObj: any = { active: false }
      const templateObj: any = {}
      const transactionObj: any = {}

      const { role, distributor_id: distributorId }: any = req.user

      if (noOfMines) whereObj.mines_count = noOfMines
      if (betId) whereObj.game_id = betId
      if (gameId) whereObj.game_id = gameId
      if (payoutMultiplier) whereObj.payout_multiplier = payoutMultiplier
      if (gridType) whereObj.tiles_count = gridType
      if (minesType) whereObj.is_jackpot = minesType
      if (betType) whereObj.game_type = betType
      if (isJackpot) whereObj.is_jackpot = isJackpot

      if (gameName) templateObj.game_name = gameName

      if (transactionType) transactionObj.transaction_type = transactionType

      const playerObj: any = {
        model: Player,
        as: 'player',
        required: true,
        attributes: [
          'id',
          'player_name',
          'phone_number',
          'player_type',
          [Sequelize.literal('created_by'), 'client_name'],
        ],
        where: {},
      }

      if (playerId) playerObj.where.id = playerId
      if (playerName) playerObj.where.player_name = playerName
      if (playerType) playerObj.where.player_type = playerType
      if (phoneNumber) playerObj.where.phone_number = phoneNumber

      if (role && distributorId) {
        const roleEnum = ['super_distributor', 'distributor', 'sub_distributor', 'retailer']

        if (roleEnum.includes(role)) {
          playerObj.where[role] = distributorId
        }
      }

      if (clientName) playerObj.where['created_by'] = clientName

      if (startDate && endDate) {
        whereObj['created_at'] = {
          [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
        }
      }

      const limitValue = limit ? parseInt(limit as string, 10) : 10
      const offsetValue = offset ? parseInt(offset as string, 10) : 0
      const totalCount = await Game.count({ where: whereObj })

      const game = await Game.findAll({
        where: whereObj,
        limit: limitValue,
        offset: offsetValue,
        include: [
          playerObj,
          {
            model: Template,
            as: 'template',
            where: templateObj,
            attributes: ['id', 'game_name', 'jackpot_bonus', 'grid_options'],
          },
          {
            model: Transaction,
            as: 'transactions',
            where: transactionObj,
          },
        ],
        attributes: {
          include: [[Sequelize.literal(`CONCAT(SQRT(tiles_count), 'X', SQRT(tiles_count))`), 'grid_type']],
        },
        order: [['updated_at', 'DESC']],
      })

      return res.status(200).send({ success: true, data: { game }, count: totalCount })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },
  getGameCycle: async (_req: Request, res: Response): Promise<void | Response> => {
    try {
      const gameCycles = await GameCycle.findOne({
        where: { is_active: true },
        attributes: ['payout_percentage'],
        order: [['createdAt', 'DESC']],
      })

      return res.status(200).send({ success: true, data: gameCycles })
    } catch (error: any) {
      logger.error(`Error: ${error.message}`)
      return res.status(400).send({
        success: false,
        message: error?.message || 'Something went wrong',
      })
    }
  },

  updateGameCycle: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params
      const { payout_percentage: payoutPercentage } = req.body

      if (!id) {
        return res.status(400).send({ success: false, message: 'Missing id' })
      }

      const updateObj: any = {}

      if (payoutPercentage) updateObj.payout_percentage = payoutPercentage

      const [numberOfAffectedRows] = await GameCycle.update(updateObj, {
        where: { id },
      })

      if (numberOfAffectedRows === 0) {
        return res.status(404).send({ success: false, message: `Game Weight with id ${id} not found` })
      }

      return res.status(200).send({
        success: true,
        message: 'Game Weight updated successfully',
      })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },
}

export default controller
