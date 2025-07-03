import { Response } from 'express'
import { Op } from 'sequelize'
import { Request } from '../interfaces/generic'
import { logger } from '../shared/logger'
import { Manager } from '../config/index'
import { createDistributorId } from '../shared/utils'
import { distributorLogs } from '../shared/utils'

const controller = {
  createManager: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { name, manager_key, phone_number, status, logo, permissions, sharing_percentage, sharing_type } = req.body
      // eslint-disable-next-line camelcase
      const system_ip = req.headers['x-forwarded-for'] || req.ip

      const distributorId = req.user?.distributor_id
      const managerId = createDistributorId(name)

      const manager = await Manager.create({
        name,
        distributor_id: distributorId,
        manager_id: managerId,
        manager_key,
        phone_number,
        status,
        logo,
        permissions,
        system_ip,
        sharing_percentage,
        sharing_type,
      })

      if (
        req.user?.role === 'super_distributor' ||
        req.user?.role === 'distributor' ||
        req.user?.role === 'sub_distributor'
      ) {
        await distributorLogs(req.user, 'Create Manager', (req.headers['x-forwarded-for'] as string)?.split(',')[0])
      }

      return res.status(201).send({ success: true, data: { manager } })
    } catch (e: any) {
      logger.error(`Error: ${e}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  getManager: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const {
        limit,
        offset,
        role,
        status,
        id,
        manager_id: managerId,
        name,
        sharing_type: sharingType,
        game,
      } = req.query
      const whereObj: any = { distributor_id: req?.user?.distributor_id }

      if (role) whereObj.role = role
      if (status) whereObj.status = status
      if (managerId) whereObj.manager_id = managerId
      if (id) whereObj.id = id
      if (name) whereObj.name = { [Op.iLike]: `%${name}%` }
      if (sharingType) whereObj.sharing_type = sharingType
      if (game) whereObj.game = { [Op.contains]: [game] }

      const limitValue = limit ? parseInt(limit as string, 10) : 10
      const offsetValue = offset ? parseInt(offset as string, 10) : 0
      const totalCount = await Manager.count({ where: whereObj })
      const manager = await Manager.findAll({
        where: whereObj,
        limit: limitValue,
        offset: offsetValue,
        order: [['updated_at', 'DESC']],
      })

      return res.status(200).send({ success: true, data: { manager }, count: totalCount })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  updateManager: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params

      const [updated] = await Manager.update(req.body, {
        where: { id },
      })

      if (updated === 0) {
        throw new Error(`manager with id ${id} not found`)
      }

      if (
        req.user?.role === 'super_distributor' ||
        req.user?.role === 'distributor' ||
        req.user?.role === 'sub_distributor'
      ) {
        await distributorLogs(
          req.user,
          `Update Manager ${id}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
        )
      }

      return res.status(201).send({ success: true, message: `manager with id ${id} updated successfully`, updated })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  deleteManager: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params

      const deleted = await Manager.destroy({ where: { id } })

      if (deleted === 0) {
        throw new Error(`manager with id ${id} not found`)
      }

      if (
        req.user?.role === 'super_distributor' ||
        req.user?.role === 'distributor' ||
        req.user?.role === 'sub_distributor'
      ) {
        await distributorLogs(
          req.user,
          `Delete Manager ${id}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
        )
      }

      return res.status(201).send({
        success: true,
        message: `manager with id ${id} deleted successfully`,
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
