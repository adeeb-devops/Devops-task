import { Response } from 'express'
import { Request } from '../interfaces/generic'
import { logger } from '../shared/logger'
import { redis } from '../config/redis'
import { Template } from '../config'
import { Op } from 'sequelize'

const controller = {
  getTemplate: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const {
        limit,
        offset,
        active,
        is_jackpot: isJackpot,
        grid_type: gridType,
        is_disabled: isDisabled,
        game_name: gameName,
        id,
        startDate,
        endDate,
      }: any = req.query
      logger.info(req.body)

      const whereObj: any = { active: true }

      if (!req.user?.role) {
        whereObj.is_disabled = false
      }

      if (active) whereObj.active = active
      if (id) whereObj.id = id
      if (isJackpot) whereObj.is_jackpot = isJackpot
      if (gridType) whereObj.grid_type = gridType
      if (isDisabled) whereObj.is_disabled = isDisabled
      if (gameName) whereObj.game_name = gameName
      if (startDate && endDate) {
        whereObj.created_at = { [Op.between]: [new Date(String(startDate)), new Date(String(endDate))] }
      }

      const limitValue = limit ? parseInt(limit as string, 10) : 10
      const offsetValue = offset ? parseInt(offset as string, 10) : 0

      const { count, rows: templates } = await Template.findAndCountAll({
        where: whereObj,
        limit: limitValue,
        offset: offsetValue,
        order: [['created_at', 'DESC']],
        distinct: true,
      })

      return res.status(200).send({ success: true, data: templates, count })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  addTemplate: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const templateArray = req.body.templates

      if (!templateArray || !Array.isArray(templateArray) || templateArray.length === 0) {
        throw new Error('No templates provided')
      }

      if (templateArray[0]?.rake_percentage > 100) {
        throw new Error('Rake percentage cannot be greater than 100')
      }

      const createdTemplates = await Template.bulkCreate(templateArray)

      for (const template of createdTemplates) {
        const redisKey = `mines-template-${(template as any).id}`
        await redis.hset(redisKey, {
          id: (template as any).id,
          grid_options: (template as any).grid_options,
          is_disabled: (template as any).is_disabled,
          jackpot_bonus: (template as any).jackpot_bonus,
          active: (template as any).active,
          rake_percentage: (template as any).rake_percentage,
          min_bet: (template as any).min_bet,
          max_bet: (template as any).max_bet,
        })
      }

      return res.status(200).send({ success: true, data: createdTemplates })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({ success: false, message: e?.message || 'Something went wrong' })
    }
  },
  updateTemplate: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const templateId = req.params.id
      const updatedFields = req.body

      const [rowsUpdateCount, [updatedTemplate]] = await Template.update(updatedFields, {
        where: { id: templateId },
        returning: true,
      })

      if (rowsUpdateCount === 0) {
        return res.status(404).json({ success: false, message: 'Template not found.' })
      }

      const template = updatedTemplate as any

      const redisKey = `mines-template-${templateId}`
      await redis.hset(redisKey, {
        id: template.id,
        grid_options: template.grid_options,
        is_disabled: template.is_disabled,
        jackpot_bonus: template.jackpot_bonus,
        active: template.active,
        min_bet: template.min_bet,
        max_bet: template.max_bet,
      })

      return res.status(200).json({ success: true, data: updatedTemplate })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).json({ success: false, message: e?.message || 'Something went wrong' })
    }
  },

  deleteTemplate: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      logger.info(req.body)
      const templateId = req.params.id

      const [rowsUpdateCount] = await Template.update(
        { active: false },
        {
          where: { id: templateId },
        },
      )

      if (rowsUpdateCount === 0) {
        return res.status(404).json({ success: false, message: 'Template not found.' })
      }

      const redisKey = `mines-template-${templateId}`
      await redis.del(redisKey)

      return res.status(200).json({ success: true, message: 'Template deleted successfully.' })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).json({ success: false, message: e?.message || 'Something went wrong' })
    }
  },
}
export default controller
