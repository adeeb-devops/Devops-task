import { Response } from 'express'
import { Op } from 'sequelize'
import { Request } from '../interfaces/generic'
import { logger } from '../shared/logger'
import { Maintenance } from '../config'

const controller = {
  initiateMaintenance: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { message, time, maintenance_key: maintenanceKey } = req.body

      const maintenanceData: any = {}
      if (maintenanceKey) {
        if (!message) throw new Error(`Message is missing`)
        if (time) {
          maintenanceData.start_time = new Date(time)
        }

        maintenanceData.message = message
        maintenanceData.maintenance_key = true
      } else {
        maintenanceData.maintenance_key = false
      }

      const existingRecord = await Maintenance.findOne()

      let result
      if (existingRecord) {
        result = await existingRecord.update(maintenanceData)
      } else {
        result = await Maintenance.create(maintenanceData)
      }

      return res.status(201).send({ success: true, data: result })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  updateMaintenance: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { id } = req.params
      const [updated] = await Maintenance.update(req.body, {
        where: { id },
      })

      if (updated === 0) {
        throw new Error(`Maintenance with id ${id} not found`)
      }

      return res.status(200).send({ success: true, message: `Maintenance with id ${id} updated successfully`, updated })
    } catch (e: any) {
      logger.error(`Error: ${e.message}`)
      return res.status(400).send({
        success: false,
        message: e?.message || 'Something went wrong',
      })
    }
  },

  deleteMaintenance: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      logger.info(`GET request for ${req.body}`)
      const { id } = req.params
      const deleted = await Maintenance.destroy({ where: { id } })

      if (deleted === 0) {
        throw new Error(`User with id ${id} not found`)
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

  getAllMaintenance: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const {
        limit,
        offset,
        id,
        start_date: startDate,
        end_date: endDate,
        message,
        maintenance_key: maintenanceKey,
      } = req.query
      const whereObj: any = {}

      if (id) whereObj.id = id
      if (message) whereObj.message = message
      if (maintenanceKey) whereObj.maintenance_key = maintenanceKey

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

      const totalCount = await Maintenance.count({ where: whereObj })
      const maintenanceEntries = await Maintenance.findAll({
        where: whereObj,
        limit: limitValue,
        offset: offsetValue,
        order: [['created_at', 'DESC']],
      })
      return res.status(200).send({ success: true, data: { maintenanceEntries }, count: totalCount })
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
