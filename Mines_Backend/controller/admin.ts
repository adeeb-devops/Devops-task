import { Response } from 'express'
import { Request } from '../interfaces/generic'
import { logger } from '../shared/logger'
import { Admin, AdminLogs } from '../models/admin'
import { hashPassword, comparePassword, adminLogs } from '../shared/utils'
import { constants } from '../shared/constant'
import { createToken } from '../shared/jwt'
import { Op } from 'sequelize'

const controller = {
  loginAdmin: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { username, password, phone_number: phoneNumber } = req.body
      if (!(username && password)) throw new Error('Invalid username and password')
      const whereObj: any = {}
      if (username) whereObj.username = username
      if (phoneNumber) whereObj.phone_number = phoneNumber

      const admin: any = await Admin.findOne({ where: whereObj })
      if (!admin) return res.status(404).send({ success: false, message: 'User not found' })
      const hashedPassword = admin.password
      if (!hashedPassword) throw new Error('User not found')
      const compare = await comparePassword(password, hashedPassword)
      if (!compare) throw new Error('Invalid password')
      whereObj.permissions = admin.permissions
      whereObj.id = admin.id
      whereObj.role = admin.role
      const jwtToken = await createToken(whereObj)
      const loginTime = new Date()
      const expiryTime = new Date()
      let jwtExpiryHours = process.env.JWT_TOKEN_EXPIRY_TIME
      jwtExpiryHours = jwtExpiryHours?.split('h')?.[0]
      expiryTime.setHours(expiryTime.getHours() + Number(jwtExpiryHours))

      if (admin.status === 'Blocked') {
        return res.status(401).json({ message: 'Access denied: Admin is blocked' })
      }

      // Log the login action
      await AdminLogs.create({
        username: admin.username,
        ipaddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0],
        actionName: 'Login',
      })

      return res.status(200).send({
        success: true,
        adminName: username,
        expiryTime,
        loginTime,
        token: jwtToken,
        permissions: admin.permissions,
        status: admin.status,
      })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  createAdmin: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { phone_number: phoneNumber, username, password, permissions } = req.body
      let { parent_id: parentId } = req.body

      if (phoneNumber && phoneNumber.toString().length !== 10) {
        throw new Error('Phone number must be exactly 10 digits')
      }

      const getAdmin = await Admin.findOne({ where: { phone_number: phoneNumber, username } })
      if (getAdmin) throw new Error('Admin already exists')
      if (!parentId) {
        parentId = req.user?.id
      }

      const hashedPassword = await hashPassword(password)
      const adminObj = {
        phone_number: phoneNumber,
        username,
        password: hashedPassword,
        permissions,
        role: constants.admin,
        parent_id: parentId,
        status: 'active',
      }
      const admin: any = await Admin.create(adminObj)
      delete admin.password

      // Log the admin creation action

      await adminLogs(
        req.user?.username,
        `Create Admin (${username})`,
        (req.headers['x-forwarded-for'] as string)?.split(',')[0],
        req.user?.last_login,
      )

      return res.status(201).send({ success: true, data: { admin } })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  getAdmin: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const {
        limit,
        offset,
        id,
        start_date: startDate,
        end_date: endDate,
        status,
        username,
        role,
        phone_number: phoneNumber,
      } = req.query

      const whereObj: any = {}

      const adminId = req.user?.id

      if (id) whereObj.id = id
      if (status) whereObj.status = status
      if (username) whereObj.username = username
      if (phoneNumber) whereObj.phone_number = phoneNumber
      if (role) whereObj.role = role

      const limitValue = limit ? parseInt(limit as string, 10) : 10
      const offsetValue = offset ? parseInt(offset as string, 10) : 0

      if (startDate) {
        whereObj.createdAt = {
          ...whereObj.createdAt,
          [Op.gte]: new Date(String(startDate)),
        }
      }

      if (endDate) {
        whereObj.createdAt = {
          ...whereObj.createdAt,
          [Op.lte]: new Date(String(endDate)),
        }
      }

      const totalCount = await Admin.count({
        where: {
          ...whereObj,
          parent_id: adminId,
        },
      })

      const admin = await Admin.findAll({
        where: {
          ...whereObj,
        },
        limit: limitValue,
        offset: offsetValue,
        order: [['created_at', 'DESC']],
      })

      return res.status(200).send({
        success: true,
        data: { admin },
        count: totalCount,
      })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  updateAdmin: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params
      const { password, permissions, status } = req.body
      const updateBody: any = {}
      if (password) {
        updateBody.password = await hashPassword(password)
      }

      if (permissions) updateBody.permissions = permissions
      if (status) updateBody.status = status

      const [updated] = await Admin.update(updateBody, {
        where: { id },
      })

      if (updated === 0) {
        throw new Error(`Admin with id ${id} not found`)
      }

      // Log the update action
      await adminLogs(
        req.user?.username,
        `Update Admin ${id}`,
        (req.headers['x-forwarded-for'] as string)?.split(',')[0],
        req.user?.last_login,
      )

      return res.status(200).send({ success: true, message: `Admin with id ${id} updated successfully`, updated })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  deleteAdmin: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params
      const adminID = req.user?.id
      const admin = await Admin.findOne({ where: { id } })

      if (!admin) {
        throw new Error(`Admin with id ${id} not found`)
      }

      if (admin?.dataValues.parent_id !== adminID) {
        throw new Error(`Admin with id ${id} can not be deleted`)
      }

      await Admin.destroy({ where: { id } })

      // Log the delete action

      await adminLogs(
        req.user?.username,
        `Delete Admin ${id}`,
        (req.headers['x-forwarded-for'] as string)?.split(',')[0],
        req.user?.last_login,
      )

      return res.status(200).send({ success: true, message: `Admin with id ${id} deleted successfully` })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  getAdminLogs: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { username, ipAddress, Action, startDate, endDate, limit, offset } = req.query

      const whereClause: any = {}

      if (username) whereClause.username = username
      if (ipAddress) whereClause.ipaddress = ipAddress
      if (Action) whereClause.actionName = Action

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

      const totalCount = await AdminLogs.count({
        where: whereClause,
      })

      const logs = await AdminLogs.findAll({
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
  logoutAdmin: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      await adminLogs(
        req.user?.username,
        'Logout',
        (req.headers['x-forwarded-for'] as string)?.split(',')[0],
        req.user?.last_login,
      )
      return res.status(200).send({ success: true, message: 'Logout successfully' })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },
  changePassword: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id, newPassword } = req.body

      const adminId = id

      const admin = await Admin.findByPk(adminId)
      if (!admin) throw new Error('Admin not found')

      const hashedNewPassword = await hashPassword(newPassword)
      await Admin.update({ password: hashedNewPassword }, { where: { id: adminId } })

      await AdminLogs.create({
        username: req.user?.username,
        ipaddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0],
        actionName: 'Change Password',
      })

      return res.status(200).send({ success: true, message: 'Password changed successfully' })
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
