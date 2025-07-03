import { Op } from 'sequelize'
import { Maintenance } from '../config'
import { logger } from '../shared/logger'

export const checkMaintenanceStatus = async (): Promise<boolean> => {
  try {
    const currentTime = new Date()

    const maintenance = await Maintenance.findOne({
      where: {
        maintenance_key: true,
        start_time: {
          [Op.lte]: currentTime,
        },
      },
    })

    if (maintenance) return true
    return false
  } catch (error) {
    logger.error('Error checking maintenance status:', error)
    return false
  }
}
