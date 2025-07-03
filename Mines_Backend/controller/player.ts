import { Response } from 'express'
import { Op, Sequelize } from 'sequelize'
import jwt from 'jsonwebtoken'
import { getEnv } from '../shared/env'
import { Request } from '../interfaces/generic'
import { logger } from '../shared/logger'
import { Distributor, Player, Transaction } from '../config/index'
import { createToken } from '../shared/jwt'
import { adminLogs, distributorLogs } from '../shared/utils'
import { sequelize } from '../config/db'
import { UAParser } from 'ua-parser-js'
import { getDateRanges } from '../shared/utils'
import { checkMaintenanceStatus } from '../middleware/maintenance'

const controller = {
  login: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const {
        // player_name: playerName,
        phone_number: phoneNumber,
        user_name: username,
        distributor_id: playerDistributorId,
        distributor_key: distributorKey,
        wallet_balance: walletBalance,
      } = req.body

      const maintenanceStatus = await checkMaintenanceStatus()
      if (maintenanceStatus) {
        return res.status(503).send({
          success: false,
          message: 'Service is under maintenance',
        })
      }

      // Fetch IP address and user-agent details
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress
      const mobileUniqueId = req.body.mobile_unique_id || req.headers['mobile-unique-id']
      // Parse user-agent for device and browser info
      const uaParser = UAParser(req.headers['user-agent']) // Correct usage
      const userAgent = uaParser // Get parsed result directly

      const distributorData: any = await Distributor.findOne({
        where: {
          distributor_id: playerDistributorId,
          distributor_key: distributorKey,
        },
      })

      if (!distributorData) {
        throw new Error('Wrong distributor credential')
      }

      if (distributorData.status === 'inactive') {
        throw new Error('Access Denied: Your client account is currently inactive.')
      }

      const {
        role,
        distributor_id: distributorId,
        parent_id: parentId,
        organization_id: distributorOrganizationId,
      } = distributorData

      let retailer, subDistributor, distributor, superDistributor

      const hierarchy = await resolveHierarchy(parentId)

      if (role === 'retailer') {
        retailer = distributorId
        subDistributor = hierarchy.subDistributor || null
        distributor = hierarchy.distributor || null
        superDistributor = hierarchy.superDistributor || null
      } else if (role === 'sub_distributor') {
        subDistributor = distributorId
        distributor = hierarchy.distributor || null
        superDistributor = hierarchy.superDistributor || null
      } else if (role === 'distributor') {
        distributor = distributorId
        superDistributor = hierarchy.superDistributor || null
      } else if (role === 'super_distributor') {
        superDistributor = distributorId
      } else {
        throw new Error(`Invalid distributor role specified`)
      }

      const createdBy = retailer || subDistributor || distributor || superDistributor

      let organizationId = distributorOrganizationId
      if (!organizationId) {
        organizationId = superDistributor
      }

      const createObj: any = {
        // player_name: playerName,
        phone_number: phoneNumber,
        username: username,
        organization_id: organizationId,
        created_by: createdBy,
        super_distributor: superDistributor,
        distributor,
        sub_distributor: subDistributor,
        retailer,
        last_login: new Date(),
        system_ip: ipAddress,
        device_type: userAgent.device.type || 'desktop',
        app_type: 'Web', // Adjust based on app logic
        device_model: userAgent.device.model || 'Unknown',
        browser: userAgent.browser.name || 'Unknown',
        mobile_unique_id: mobileUniqueId || 'Unknown',
      }

      createObj.balance = walletBalance ?? 1000000

      const [user, created] = await Player.findOrCreate({
        where: {
          player_id: `${distributorOrganizationId}_${username}`,
        },
        defaults: createObj,
      })

      if (user.dataValues.status === 'inactive') {
        return res.status(401).json({ message: 'Access denied: User is blocked' })
      }

      if (!created) {
        await user.update({
          last_login: new Date(),
          balance: walletBalance,
          system_ip: ipAddress,
          device_type: userAgent.device.type || 'desktop',
          app_type: 'Web',
          device_model: userAgent.device.model,
          browser: userAgent.browser.name,
          mobile_unique_id: mobileUniqueId,
        })
      } else {
        // Set default balance for newly created users
        await user.update({
          balance: 1000000,
        })
      }

      const token = await createToken(user?.dataValues)

      return res.status(201).send({ success: true, data: { user, token } })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  platformLogin: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const {
        phone_number: phoneNumber,
        user_name: username,
        distributor_id: playerDistributorId,
        distributor_key: distributorKey,
        wallet_balance: walletBalance,
      } = req.body

      const maintenanceStatus = await checkMaintenanceStatus()
      if (maintenanceStatus) {
        return res.status(503).send({
          success: false,
          message: 'Service is under maintenance',
        })
      }

      // Fetch IP address and user-agent details
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress
      const mobileUniqueId = req.body.mobile_unique_id || req.headers['mobile-unique-id']
      // Parse user-agent for device and browser info
      const uaParser = UAParser(req.headers['user-agent']) // Correct usage
      const userAgent = uaParser // Get parsed result directly

      const distributorData: any = await Distributor.findOne({
        where: {
          distributor_id: playerDistributorId,
          distributor_key: distributorKey,
        },
      })

      if (!distributorData) {
        throw new Error('Wrong distributor credential')
      }

      if (distributorData.status === 'inactive') {
        throw new Error('Access Denied: Your client account is currently inactive.')
      }

      const {
        role,
        distributor_id: distributorId,
        parent_id: parentId,
        organization_id: distributorOrganizationId,
      } = distributorData

      let retailer, subDistributor, distributor, superDistributor

      const hierarchy = await resolveHierarchy(parentId)

      if (role === 'retailer') {
        retailer = distributorId
        subDistributor = hierarchy.subDistributor || null
        distributor = hierarchy.distributor || null
        superDistributor = hierarchy.superDistributor || null
      } else if (role === 'sub_distributor') {
        subDistributor = distributorId
        distributor = hierarchy.distributor || null
        superDistributor = hierarchy.superDistributor || null
      } else if (role === 'distributor') {
        distributor = distributorId
        superDistributor = hierarchy.superDistributor || null
      } else if (role === 'super_distributor') {
        superDistributor = distributorId
      } else {
        throw new Error(`Invalid distributor role specified`)
      }

      const createdBy = retailer || subDistributor || distributor || superDistributor

      let organizationId = distributorOrganizationId
      if (!organizationId) {
        organizationId = superDistributor
      }

      const createObj: any = {
        // player_name: playerName,
        phone_number: phoneNumber,
        username: username,
        organization_id: organizationId,
        created_by: createdBy,
        super_distributor: superDistributor,
        distributor,
        sub_distributor: subDistributor,
        retailer,
        last_login: new Date(),
        system_ip: ipAddress,
        device_type: userAgent.device.type || 'desktop',
        app_type: 'Web', // Adjust based on app logic
        device_model: userAgent.device.model || 'Unknown',
        browser: userAgent.browser.name || 'Unknown',
        mobile_unique_id: mobileUniqueId || 'Unknown',
      }

      if (walletBalance !== undefined) {
        createObj.balance = walletBalance
      }

      const [user, created] = await Player.findOrCreate({
        where: {
          player_id: `${distributorOrganizationId}_${username}`,
        },
        defaults: createObj,
      })

      if (user.dataValues.status === 'inactive') {
        return res.status(401).json({ message: 'Access denied: User is blocked' })
      }

      if (!created) {
        await user.update({
          balance: walletBalance,
          last_login: new Date(),
          system_ip: ipAddress,
          device_type: userAgent.device.type || 'desktop',
          app_type: 'Web',
          device_model: userAgent.device.model,
          browser: userAgent.browser.name,
          mobile_unique_id: mobileUniqueId,
        })
      }

      const token = await createToken(user?.dataValues)

      return res.status(201).send({ success: true, data: { user, token } })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  createPlayer: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { player_name: playerName, phone_number: phoneNumber, status, player_type, balance, username } = req.body

      let { super_distributor: superDistributor, distributor, sub_distributor: subDistributor, retailer } = req.body

      if (!req.user) {
        throw new Error('User information is missing from token')
      }

      if (phoneNumber && phoneNumber.toString().length !== 10) {
        throw new Error('Phone number must be exactly 10 digits')
      }

      const { role } = req.user

      if (role === 'retailer') {
        retailer = req.user?.distributor_id
        let parentDistributor = await parentDistributorId(req.user?.parent_id)
        subDistributor = parentDistributor.distributor_id
        parentDistributor = await parentDistributorId(parentDistributor?.parent_id)
        distributor = parentDistributor.distributor_id
        parentDistributor = await parentDistributorId(parentDistributor?.parent_id)
        superDistributor = parentDistributor.distributor_id
      } else if (role === 'sub_distributor') {
        subDistributor = req.user?.distributor_id
        let parentDistributor = await parentDistributorId(req.user?.parent_id)
        distributor = parentDistributor.distributor_id
        parentDistributor = await parentDistributorId(parentDistributor?.parent_id)
        superDistributor = parentDistributor.distributor_id
      } else if (role === 'distributor') {
        distributor = req.user?.distributor_id
        const parentDistributor = await parentDistributorId(req.user?.parent_id)

        superDistributor = parentDistributor.distributor_id
      } else if (role === 'super_distributor') {
        superDistributor = req.user?.distributor_id
      } else {
        if (!superDistributor) throw new Error(`Super distributer id is missing`)
      }

      const createdBy = retailer || subDistributor || distributor || superDistributor
      let createdByAdmin = null
      if (role == 'master_admin' || role == 'admin') {
        createdByAdmin = req.user?.username
      }

      let organizationId = req.user?.organization_id
      if (!organizationId) {
        organizationId = superDistributor
      }

      const user = await Player.create({
        player_name: playerName,
        phone_number: phoneNumber,
        username: username || playerName,
        organization_id: organizationId,
        created_by: createdBy,
        status,
        player_type,
        balance,
        super_distributor: superDistributor,
        distributor,
        sub_distributor: subDistributor,
        retailer,
        created_by_admin: createdByAdmin,
      })

      if (req.user?.role == 'master_admin' || req.user?.role == 'admin') {
        await adminLogs(
          req.user?.username,
          `Created Player ${playerName}`,
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
        await distributorLogs(req.user, 'Create Player', (req.headers['x-forwarded-for'] as string)?.split(',')[0])
      }

      return res.status(201).send({ success: true, data: { user } })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  getPlayers: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const {
        limit = 10,
        offset = 0,
        status,
        id,
        player_name: playerName,
        phone_number: phoneNumber,
        player_id: playerId,
        startDate,
        endDate,
        player_type: playerType,
        super_distributor: superDistributor,
        distributor,
        sub_distributor: subDistributor,
        retailer,
      }: any = req.query

      if (!req.user) {
        return res.status(401).send({ success: false, message: 'Unauthorized access' })
      }

      const whereObj: any = {}
      const includeConditions: any[] = []
      const { role, organization_id: orgId, distributor_id: distId } = req.user

      const roleConditions: Record<string, () => void> = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        master_admin: () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        admin: () => {},
        super_distributor: () => {
          whereObj.organization_id = orgId
          includeConditions.push({
            model: Distributor,
            as: 'organizationHead',
            where: { distributor_id: distId },
            required: true,
          })
        },
        distributor: () => {
          whereObj.organization_id = orgId
          includeConditions.push({
            model: Distributor,
            as: 'organizationHead',
            where: { distributor_id: distId },
            required: true,
          })
        },
        sub_distributor: () => {
          whereObj.organization_id = orgId
          includeConditions.push({
            model: Distributor,
            as: 'organizationHead',
            where: { distributor_id: distId },
            required: true,
          })
        },
        retailer: () => {
          whereObj.organization_id = orgId
          whereObj.created_by = distId
        },
      }

      if (roleConditions[role]) {
        roleConditions[role]()
      } else {
        return res.status(403).send({ success: false, message: 'Invalid user role' })
      }

      if (status) whereObj.status = status
      if (id) whereObj.id = id
      if (playerName) whereObj.player_name = { [Op.iLike]: `%${playerName}%` }
      if (phoneNumber) whereObj.phone_number = phoneNumber
      if (playerType) whereObj.player_type = playerType
      if (playerId) whereObj.player_id = playerId
      if (superDistributor) whereObj.super_distributor = superDistributor
      if (distributor) whereObj.distributor = distributor
      if (subDistributor) whereObj.sub_distributor = subDistributor
      if (retailer) whereObj.retailer = retailer
      if (startDate && endDate) {
        whereObj.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] }
      }

      const limitValue = parseInt(limit as string, 10)
      const offsetValue = parseInt(offset as string, 10)

      const [data, statusCounts] = await Promise.all([
        Player.findAndCountAll({
          where: whereObj,
          limit: limitValue || 10,
          offset: offsetValue || 0,
          order: [['created_at', 'DESC']],
          include: [
            { model: Distributor, as: 'organizationHead', attributes: ['name', 'distributor_id'] },
            { model: Distributor, as: 'playerSuperDistributor', attributes: ['name', 'distributor_id'] },
            { model: Distributor, as: 'playerDistributor', attributes: ['name', 'distributor_id'] },
            { model: Distributor, as: 'playerSubDistributor', attributes: ['name', 'distributor_id'] },
            { model: Distributor, as: 'playerRetailer', attributes: ['name', 'distributor_id'] },
          ],
        }),

        Player.findAll({
          where: whereObj,
          attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
          group: ['status'],
          raw: true,
        }),
      ])

      const { rows: users, count: totalCount } = data

      // Extract status counts
      const activePlayers = Number(statusCounts.find((s: any) => s?.status === 'active')?.count) || 0
      const inactivePlayers = Number(statusCounts.find((s: any) => s?.status === 'inactive')?.count) || 0

      return res.status(200).json({
        success: true,
        data: users,
        count: totalCount,
        activePlayers,
        inactivePlayers,
      })
    } catch (e: any) {
      logger.error(`Error in getPlayers: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  deletePlayer: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params

      const deleted = await Player.destroy({ where: { id } })

      if (deleted === 0) {
        throw new Error(`User with id ${id} not found`)
      }

      if (req.user?.role == 'master_admin' || req.user?.role == 'admin') {
        await adminLogs(
          req.user?.username,
          `Deleted Player ${id}`,
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
        await distributorLogs(req.user, 'Delete Player', (req.headers['x-forwarded-for'] as string)?.split(',')[0])
      }

      return res.status(201).send({ success: true, message: `User with id ${id} deleted successfully` })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  updatePlayer: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params

      const [updated] = await Player.update(req.body, {
        where: { id },
      })

      if (updated === 0) {
        throw new Error(`User with id ${id} not found`)
      }

      if (req.user?.role == 'master_admin' || req.user?.role == 'admin') {
        await adminLogs(
          req.user?.username,
          `Updated Player ${id}`,
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
          `Updated Player ${id}`,
          (req.headers['x-forwarded-for'] as string)?.split(',')[0],
        )
      }

      return res.status(201).send({ success: true, message: `User with id ${id} updated successfully`, updated })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  updatePlayerName: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params
      const { player_name: playerName } = req.body

      if (!playerName || playerName.trim().length === 0) {
        throw new Error(`player_name should be valid, current value is ${playerName}`)
      }

      const [updatedCount, updatedUsers] = await Player.update(
        { player_name: playerName },
        {
          where: { id },
          returning: true,
          raw: true,
        },
      )

      if (updatedCount === 0 || !updatedUsers.length) {
        throw new Error(`User with id ${id} not found`)
      }

      const updatedUser = updatedUsers[0]

      const token = await createToken(updatedUser)

      return res.status(200).send({
        success: true,
        message: 'Player name updated.',
        data: { user: updatedUser, token },
      })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  getBalance: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id: playerId }: any = req.user

      const player = await Player.findOne({
        where: { id: String(playerId) },
        attributes: ['player_id', 'player_name', 'phone_number', 'balance'],
      })

      // Check if player exists
      if (!player) {
        return res.status(404).send({ success: false, message: 'Player not found.' })
      }

      return res.status(200).send({
        success: true,
        data: {
          player_id: player.player_id,
          player_name: player.player_name,
          phone_number: player.phone_number,
          balance: player.balance?.toFixed(2),
        },
      })
    } catch (e: any) {
      logger.error(`Error fetching player balance: ${e.message}`)
      return res.status(500).send({ success: false, message: 'Internal Server Error' })
    }
  },

  getPlayerBalance: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id, player_name: playerName } = req.query
      const whereObj: any = {}

      if (!id && !playerName) {
        return res.status(400).send({ success: false, data: null })
      }

      if (id) {
        whereObj.id = id
      }

      if (playerName) {
        if (playerName) whereObj.player_name = playerName
      }

      const player = await Player.findOne({
        where: whereObj,
        attributes: ['id', 'player_name', 'balance'],
      })
      return res.status(200).send({ success: true, data: player })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  updatePlayerBalance: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { playerName, amount, action } = req.body

      if (!playerName && !amount && !action) {
        return res.status(400).send({ success: false, message: 'Missing required fields' })
      }

      const player = await Player.findOne({
        where: { player_name: playerName },
        attributes: ['id', 'player_name', 'balance', 'status'],
      })

      if (!player) {
        return res.status(404).send({ success: false, message: 'Player not found' })
      }

      const openingBalance = player.balance
      let closingBalance

      if (action === 'CREDIT') {
        closingBalance = openingBalance + amount
        player.balance += amount
      } else if (action === 'DEDUCT') {
        if (openingBalance < amount) {
          return res.status(400).send({ success: false, message: 'Insufficient balance' })
        }

        closingBalance = openingBalance - amount
        player.balance = closingBalance
      } else {
        return res.status(400).send({ success: false, message: 'Invalid action' })
      }

      await player.save()

      await Transaction.create({
        player_name: player.player_name,
        transaction_type: action === 'CREDIT' ? 'credit' : 'deduct',
        amount: amount,
        opening_balance: openingBalance,
        closing_balance: closingBalance,
        commission_amount: 0,
      })

      return res.status(200).send({ success: true, data: player })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  changeStatus: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { playerIds } = req.body

      const changeStatus = await Player.update(
        {
          status: sequelize.literal(`
            CASE 
              WHEN status = 'active' THEN 'inactive'
              WHEN status = 'inactive' THEN 'active'
              ELSE status 
            END
          `),
        },
        {
          where: {
            id: {
              [Op.in]: playerIds,
            },
          },
        },
      )

      return res.status(200).send({
        success: true,
        message: 'Players status updated successfully',
        data: changeStatus,
      })
    } catch (e: any) {
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  getTokenData: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const env = getEnv()
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]
      if (!token) return res.status(401).send({ success: false, message: 'Token missing' })
      jwt.verify(token, env.jwtSecretKey, (err: any, decoded: any) => {
        if (err) return res.status(403).send({ success: false, message: 'Invalid jwt token' })
        return res.status(200).send({ success: true, data: decoded })
      })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  getPlayerLivePL: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { playerId, startDate, endDate, playerName, status, limit, offset, playerType, clientName, username }: any =
        req.query

      const { todayStart, last7DaysStart, weekStart, monthStart, lastMonthStart, lastMonthEnd, threeMonthsStart } =
        getDateRanges()

      const limitValue = limit ? parseInt(limit as string, 10) : 10
      const offsetValue = offset ? parseInt(offset as string, 10) : 0

      // Query filters
      const whereClause: any = {}
      const superDistClause: any = {}

      if (startDate && endDate) {
        whereClause.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] }
      }

      if (playerId) whereClause.id = playerId
      if (playerName) whereClause.player_name = { [Op.like]: `%${playerName}%` }
      if (username) whereClause.username = { [Op.like]: `%${username}%` }
      if (status) whereClause.status = status
      if (playerType) whereClause.player_type = playerType
      if (clientName) {
        superDistClause.name = clientName // Filter by super distributor name
      }

      const groupAttributes = [
        'Player.id',
        'playerSuperDistributor.name',
        'playerSuperDistributor.sharing_type',
        sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'self')::numeric`),
        sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'client')::numeric`),
      ]

      // Fetch user report data
      const userReports = await Player.findAndCountAll({
        where: whereClause,
        limit: limitValue,
        offset: offsetValue,
        include: [
          {
            model: Distributor,
            where: superDistClause,
            as: 'playerSuperDistributor',
            attributes: [
              'name',
              [sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'client')::numeric`), 'client'],
            ],
          },
          {
            model: Transaction,
            as: 'transactions',
            attributes: [
              // Lifetime P&L
              [
                sequelize.fn(
                  'SUM',
                  sequelize.literal(`CASE 
                WHEN transaction_type = 'bet-win' THEN winning_amount - betting_amount ELSE 0 END`),
                ),
                'lifetimePl',
              ],
              // Today P&L
              [
                sequelize.fn(
                  'SUM',
                  sequelize.literal(`CASE 
              WHEN transaction_type = 'bet-win' AND "transactions"."created_at" >= '${todayStart.toISOString()}' 
              THEN winning_amount - betting_amount ELSE 0 END`),
                ),
                'todayPl',
              ],
              // Last 7 Days P&L
              [
                sequelize.fn(
                  'SUM',
                  sequelize.literal(`CASE 
              WHEN transaction_type = 'bet-win' 
              AND "transactions"."created_at" >= '${last7DaysStart.toISOString()}'
              THEN winning_amount - betting_amount ELSE 0 END`),
                ),
                'last7DaysPl',
              ],
              // This Week P&L
              [
                sequelize.fn(
                  'SUM',
                  sequelize.literal(`CASE 
              WHEN transaction_type = 'bet-win' AND "transactions"."created_at" >= '${weekStart.toISOString()}' 
              THEN winning_amount - betting_amount ELSE 0 END`),
                ),
                'weekPl',
              ],
              // This Month P&L
              [
                sequelize.fn(
                  'SUM',
                  sequelize.literal(`CASE 
              WHEN transaction_type = 'bet-win' AND "transactions"."created_at" >= '${monthStart.toISOString()}' 
              THEN winning_amount - betting_amount ELSE 0 END`),
                ),
                'monthPl',
              ],
              // Last Month P&L
              [
                sequelize.fn(
                  'SUM',
                  sequelize.literal(`CASE 
              WHEN transaction_type = 'bet-win' AND "transactions"."created_at" BETWEEN '${lastMonthStart.toISOString()}' AND '${lastMonthEnd.toISOString()}'
              THEN winning_amount - betting_amount ELSE 0 END`),
                ),
                'lastMonthPl',
              ],
              // Last 3 Months P&L
              [
                sequelize.fn(
                  'SUM',
                  sequelize.literal(`CASE 
              WHEN transaction_type = 'bet-win' AND "transactions"."created_at" >= '${threeMonthsStart.toISOString()}'
              THEN winning_amount - betting_amount ELSE 0 END`),
                ),
                'threeMonthPl',
              ],
              // Lifetime P&L Percentage
              [
                sequelize.literal(`CASE 
                    WHEN SUM(betting_amount) > 0 
                    THEN ROUND(((SUM(CASE 
                                      WHEN transaction_type = 'bet-win' 
                                      THEN winning_amount - betting_amount 
                                      ELSE 0 END)::numeric) / SUM(betting_amount)::numeric) * 100::numeric, 2) 
                    ELSE 0 
                  END::numeric`),
                'lifetimePlPercentage',
              ],
              // Lifetime Betting Amount (for lifetime P&L%)
              [sequelize.fn('SUM', sequelize.literal(`betting_amount`)), 'totalBettingAmount'],
            ],
          },
        ],
        attributes: ['id', 'player_name', 'status', 'created_at', 'player_type'],
        group: groupAttributes,
        order: [['created_at', 'DESC']],
        raw: true,
        subQuery: false,
      })

      return res.status(200).json({
        success: true,
        data: {
          count: userReports?.count?.length,
          rows: userReports.rows,
        },
      })
    } catch (e: any) {
      return res.status(400).json({ error: false, message: e?.message })
    }
  },
  getPlayerInfo: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { playerName } = req.params

      const playerInfo = await Transaction.findOne({
        where: { player_name: playerName },
        attributes: [
          [Sequelize.fn('SUM', Sequelize.col('winning_amount')), 'total_winning_amount'],
          [Sequelize.fn('SUM', Sequelize.col('betting_amount')), 'total_betting_amount'],
          [
            Sequelize.fn('SUM', Sequelize.literal(`CASE WHEN transaction_type = 'credit' THEN amount ELSE 0 END`)),
            'total_credit_amount',
          ],
          [
            Sequelize.fn('SUM', Sequelize.literal(`CASE WHEN transaction_type = 'deduct' THEN amount ELSE 0 END`)),
            'total_deduct_amount',
          ],
        ],
      })
      return res.status(200).json({ success: true, playerInfo })
    } catch (error: any) {
      logger.error(error)
      return res.status(400).send({
        success: false,
        message: error?.message || 'Something went wrong',
      })
    }
  },
}

const parentDistributorId = async (id: number) => {
  try {
    if (!id) return null
    const distributor: any = await Distributor.findByPk(id)
    return distributor
  } catch (error) {
    throw Error(`Error while getting parent distributor id`)
  }
}

const resolveHierarchy = async (parentId: number) => {
  const hierarchy: any = {}
  let currentParentId: any = parentId

  while (currentParentId) {
    const parentDistributor = await parentDistributorId(currentParentId)

    if (!parentDistributor) break

    switch (parentDistributor.role) {
      case 'super_distributor':
        hierarchy.superDistributor = parentDistributor.distributor_id
        currentParentId = null
        break
      case 'distributor':
        hierarchy.distributor = parentDistributor.distributor_id
        currentParentId = parentDistributor.parent_id
        break
      case 'sub_distributor':
        hierarchy.subDistributor = parentDistributor.distributor_id
        currentParentId = parentDistributor.parent_id
        break
      default:
        throw new Error(`Unknown role in hierarchy: ${parentDistributor.role}`)
    }
  }

  return hierarchy
}

export default controller
