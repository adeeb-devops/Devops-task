import { Distributor } from '../models/distributor' // Import the model you want to check
import { logger } from '../shared/logger'

export async function initializeTable() {
  try {
    const count = await Distributor.count() // Check if the table is empty
    if (count === 0) {
      await Distributor.create({
        organization_name: 'TechImmortal',
        name: 'TechImmortal',
        organization_id: 'DefaultDist',
        distributor_id: 'DefaultDist',
        distributor_key: 'Test@123',
        role: 'super_distributor',
        phone_number: '123456789',
        status: 'active',
        permissions: [
          'Players',
          'Player Search',
          'Transactions',
          'Game Transactions',
          'Game History',
          'BO Settings',
          'BO User Settings',
          'Create BO User',
          'Reports',
          'Player Report',
          'Daily Report',
          'Game Report',
          'Upline Settlement Report',
        ],
        points: 1000,
        system_ip: '1.1.1.1',
        is_default: true,
        sharing_type: 'turnover',
        sharing_percentage: { self: '10', client: '90' },
      })
    }
  } catch (error) {
    logger.error('Error initializing table:', error)
  }
}
