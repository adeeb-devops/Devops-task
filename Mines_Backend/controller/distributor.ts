import { Response } from 'express'
import { Op } from 'sequelize'
import { Request } from '../interfaces/generic'
import { logger } from '../shared/logger'
import { Distributor, Manager } from '../config/index'
import { createToken } from '../shared/jwt'
import { adminLogs, distributorLogs } from '../shared/utils'
import { DistributorLogs } from '../models/distributor'

const controller = {
  login: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { distributor_id: distributorId, distributor_key: distributorKey } = req.body

      const [numberOfAffectedRows, [distributor]] = await Distributor.update(
        { last_login: new Date() },
        {
          where: {
            distributor_id: distributorId,
            distributor_key: distributorKey,
          },
          returning: true,
        },
      )

      if (numberOfAffectedRows === 0) {
        const [numberOfAffectedManagerRows, [manager]] = await Manager.update(
          { last_login: new Date() },
          {
            where: {
              manager_id: distributorId,
              manager_key: distributorKey,
            },
            returning: true,
          },
        )

        if (numberOfAffectedManagerRows === 0) {
          throw new Error('Wrong distributor credential')
        }

        if (manager.dataValues.status === 'inactive') {
          return res.status(401).json({ message: 'Access denied: Manager is blocked' })
        }

        const token = await createToken(manager?.dataValues)

        return res.status(201).send({ success: true, data: { manager, token } })
      }

      if (distributor.dataValues.status === 'inactive') {
        return res.status(401).json({ message: 'Access denied: Client is blocked' })
      }

      const parentChain: any = await getHierarchy(distributor?.dataValues?.parent_id)
      distributor.dataValues.parent_super_distributor = parentChain[0]
      distributor.dataValues.parent_distributor = parentChain[1]
      distributor.dataValues.parent_sub_distributor = parentChain[2]

      const token = await createToken(distributor?.dataValues)

      return res.status(201).send({ success: true, data: { distributor, token } })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  createDistributor: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const {
        name,
        distributor_key,
        phone_number: phoneNumber,
        status,
        logo,
        game,
        permissions,
        wallet_token,
        wallet_url,
        sharing_percentage,
        sharing_type,
        points,
      } = req.body
      // eslint-disable-next-line camelcase
      const system_ip = req.headers['x-forwarded-for'] || req.ip
      let { role } = req.body
      if (phoneNumber && phoneNumber.toString().length !== 10) {
        throw new Error('Phone number must be exactly 10 digits')
      }

      let parentId = req.user?.id
      const createdBy = req.user?.distributor_id
      let organizationId = req.user?.organization_id
      const distributorId = name
      let createdByAdmin
      if (req.user?.role == 'master_admin' || req.user?.role == 'admin') {
        createdByAdmin = req.user?.username
      } else createdByAdmin = req.user?.created_by_admin

      if (!createdBy) {
        organizationId = distributorId
        role = 'super_distributor'
        parentId = null
        if (!points || points <= 0) {
          throw new Error('Admin must provide valid points for the super_distributor')
        }
      } else if (req.user?.role == role) {
        throw new Error(`Distributor can't make the same role`)
      } else {
        if (points > req.user?.points) {
          throw new Error('Not enough  points available to assign to the distributor')
        }

        await Distributor.update({ points: req.user?.points - points }, { where: { id: req.user?.id } })
      }

      if (req.user?.role === 'distributor' && (role == 'super_distributor' || role == 'distributor')) {
        throw new Error(`Distributor can not make ${role}`)
      }

      if (
        req.user?.role === 'sub_distributor' &&
        (role == 'super_distributor' || role == 'distributor' || role == 'sub_distributor')
      ) {
        throw new Error(`SubDistributor can not make ${role}`)
      }

      if (
        req.user?.role === 'retailer' &&
        (role == 'super_distributor' || role == 'distributor' || role == 'sub_distributor' || role == 'retailer')
      ) {
        throw new Error(`retailer can not make ${role}`)
      }

      const distributor = await Distributor.create({
        name,
        organization_id: organizationId,
        distributor_id: distributorId,
        distributor_key,
        role,
        game,
        phone_number: phoneNumber,
        status,
        logo,
        permissions,
        wallet_token,
        wallet_url,
        parent_id: parentId,
        created_by: createdBy,
        created_by_admin: createdByAdmin,
        system_ip,
        sharing_percentage,
        sharing_type,
        points,
      })

      if (req.user?.role === 'master_admin') {
        await adminLogs(
          req.user?.username,
          `Create Distributor`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      if (
        req.user?.role === 'super_distributor' ||
        req.user?.role === 'distributor' ||
        req.user?.role === 'sub_distributor' ||
        req.user?.role === 'retailer'
      ) {
        await distributorLogs(req.user, 'Create Distributor', (req.headers['x-forwarded-for'] as string)?.split(',')[0])
      }

      return res.status(201).send({ success: true, data: { distributor } })
    } catch (e: any) {
      logger.error(`Error: ${e}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  getDistributor: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const {
        limit,
        offset,
        role,
        status,
        id,
        startDate,
        endDate,
        distributor_id: distributorId,
        name,
        phone_number: phoneNumber,
        sharing_type: sharingType,
        game,
      } = req.query
      let whereObj: any = {}

      if (req.user?.role === 'master_admin' || req.user?.role === 'admin') {
        whereObj = {}
      } else if (req.user?.role === 'super_distributor') {
        whereObj = {
          [Op.or]: [{ organization_id: req.user.organization_id }, { created_by: req.user.distributor_id }],
          id: { [Op.ne]: req.user.id },
        }
      } else if (req.user?.role === 'distributor') {
        whereObj = {
          [Op.or]: [{ parent_id: req.user.id }, { created_by: req.user.distributor_id }],
          id: { [Op.ne]: req.user.id },
        }
      } else if (req.user?.role === 'sub_distributor') {
        whereObj = {
          [Op.or]: [{ parent_id: req.user.id }, { created_by: req.user.distributor_id }],
          id: { [Op.ne]: req.user.id },
        }
      } else {
        return res.status(403).send({
          success: false,
          message: 'You do not have permission to access this resource',
        })
      }

      if (role) whereObj.role = role
      if (status) whereObj.status = status
      if (distributorId) whereObj.distributor_id = distributorId
      if (id) whereObj.id = id
      if (name) whereObj.name = { [Op.iLike]: `%${name}%` }
      if (phoneNumber) whereObj.phone_number = phoneNumber
      if (sharingType) whereObj.sharing_type = sharingType
      if (game) whereObj.game = { [Op.contains]: [game] }
      if (startDate && endDate) {
        whereObj.created_at = { [Op.between]: [new Date(String(startDate)), new Date(String(endDate))] }
      }

      const limitValue = limit ? parseInt(limit as string, 10) : 10
      const offsetValue = offset ? parseInt(offset as string, 10) : 0
      const totalCount = await Distributor.count({ where: whereObj })
      const distributor = await Distributor.findAll({
        where: whereObj,
        limit: limitValue,
        offset: offsetValue,
        order: [['created_at', 'DESC']],
      })

      return res.status(200).send({ success: true, data: { distributor }, count: totalCount })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  updateDistributor: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params

      const [updated] = await Distributor.update(req.body, {
        where: { id },
      })

      if (updated === 0) {
        throw new Error(`Distributor with id ${id} not found`)
      }

      if (req.user?.role === 'master_admin') {
        await adminLogs(
          req.user?.username,
          `Update Distributor ${id}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      if (
        req.user?.role === 'super_distributor' ||
        req.user?.role === 'distributor' ||
        req.user?.role === 'sub_distributor' ||
        req.user?.role === 'retailer'
      ) {
        await distributorLogs(req.user, 'Update Distributor', (req.headers['x-forwarded-for'] as string)?.split(',')[0])
      }

      return res.status(201).send({ success: true, message: `Distributor with id ${id} updated successfully`, updated })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  deleteDistributor: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params

      const deleted = await Distributor.destroy({ where: { id } })

      if (deleted === 0) {
        throw new Error(`Distributor with id ${id} not found`)
      }

      if (req.user?.role === 'master_admin') {
        await adminLogs(
          req.user?.username,
          `Delete Distributor ${id}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      if (
        req.user?.role === 'super_distributor' ||
        req.user?.role === 'distributor' ||
        req.user?.role === 'sub_distributor' ||
        req.user?.role === 'retailer'
      ) {
        await distributorLogs(req.user, 'Delete Distributor', (req.headers['x-forwarded-for'] as string)?.split(',')[0])
      }

      return res.status(201).send({
        success: true,
        message: `Distributor with id ${id} deleted successfully`,
      })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  filterDistributor: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { role, organization_id: organizationId, parent_id: parentId } = req.query

      const whereObj: any = {}
      if (role) whereObj.role = role
      if (organizationId) whereObj.organization_id = organizationId
      if (parentId) whereObj.parent_id = parentId

      const distributors = await Distributor.findAll({ where: whereObj })
      return res.status(200).send({ success: true, data: distributors })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  getDistributorLogs: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { distributor_id: distributorId, ipAddress, Action, Role, startDate, endDate, limit, offset } = req.query

      const whereClause: any = {}

      const role = req.user?.role
      const userDistributorId = req.user?.distributor_id
      const roleConditions: any[] = []
      if (role) {
        if (role === 'super_distributor') {
          roleConditions.push({ parent_super_distributor: userDistributorId })
        } else if (role === 'distributor') {
          roleConditions.push({ parent_distributor: userDistributorId })
        } else if (role === 'sub_distributor') {
          roleConditions.push({ parent_sub_distributor: userDistributorId })
        }

        roleConditions.push({ distributor_id: userDistributorId })
      }

      if (roleConditions.length > 0) {
        whereClause[Op.or] = roleConditions
      }

      if (distributorId) whereClause.distributor_id = distributorId
      if (ipAddress) whereClause.ipaddress = ipAddress
      if (Action) whereClause.actionName = Action
      if (Role) whereClause.role = Role
      if (startDate) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          [Op.gte]: new Date(String(startDate)),
        }
      }

      if (endDate) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          [Op.lte]: new Date(String(endDate)),
        }
      }

      const limitValue = limit ? parseInt(limit as string, 10) : 10
      const offsetValue = offset ? parseInt(offset as string, 10) : 0

      const totalCount = await DistributorLogs.count({
        where: whereClause,
      })
      const logs = await DistributorLogs.findAll({
        where: whereClause,
        limit: limitValue,
        offset: offsetValue,
        order: [['created_at', 'DESC']],
      })

      return res.status(200).send({ success: true, message: logs, count: totalCount })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },
  changeDistributorKey: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id, distributor_key: newDistributorKey } = req.body

      if (!newDistributorKey) {
        throw new Error('New distributor key is required')
      }

      const [updated] = await Distributor.update({ distributor_key: newDistributorKey }, { where: { id } })

      if (updated === 0) {
        throw new Error(`Distributor with id ${id} not found`)
      }

      if (req.user?.role === 'master_admin') {
        await adminLogs(
          req.user?.username,
          `Change Distributor Key ${id}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
          req.user?.last_login,
        )
      }

      if (
        req.user?.role === 'super_distributor' ||
        req.user?.role === 'distributor' ||
        req.user?.role === 'sub_distributor' ||
        req.user?.role === 'retailer'
      ) {
        await distributorLogs(
          req.user,
          `Change Distributor Key ${id}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
        )
      }

      return res.status(200).send({
        success: true,
        message: `Distributor key updated successfully`,
      })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },
  logoutDistributor: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      await distributorLogs(req.user, 'Logout', (req.headers['x-forwarded-for'] as string)?.split(',')[0])
      return res.status(200).send({ success: true, message: 'Logout successfully' })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },
}

export const parentDistributorId = async (id: number) => {
  try {
    if (!id) return null
    const distributor: any = await Distributor.findByPk(id)
    return distributor
  } catch (error) {
    throw Error(`Error while getting parent distributor id`)
  }
}

export const getHierarchy = async (id: number | null) => {
  let subDistributor: number | null = null
  let distributor: number | null = null
  let superDistributor: number | null = null

  let currentId = id

  while (currentId) {
    const parentDistributor = await parentDistributorId(currentId)
    if (!parentDistributor) break

    switch (parentDistributor.role) {
      case 'super_distributor':
        superDistributor = parentDistributor.distributor_id
        currentId = null
        break
      case 'distributor':
        distributor = distributor || parentDistributor.distributor_id
        currentId = parentDistributor.parent_id
        break
      case 'sub_distributor':
        subDistributor = subDistributor || parentDistributor.distributor_id
        currentId = parentDistributor.parent_id
        break
      default:
        throw new Error(`Unknown role: ${parentDistributor.role}`)
    }
  }

  return [superDistributor, distributor, subDistributor]
}

export default controller
