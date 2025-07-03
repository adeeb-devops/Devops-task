import bcrypt from 'bcrypt'
import { logger } from '../shared/logger'
import { Admin } from '../models/admin'
import { getEnv } from '../shared/env'
import { constants } from '../shared/constant'

async function createAdminIfNotExists(): Promise<void> {
  const env = getEnv()
  const adminUsername = env.adminUsername
  const adminPassword = env.adminPassword
  const adminPhoneNumber = env.adminPhoneNumber

  if (!adminUsername || !adminPassword) {
    throw new Error('Admin UserName or password not set in environment variables')
  }

  try {
    const adminExists = await Admin.findOne({ where: { username: adminUsername } })
    const permissions = [
      'Players',
      'Player Search',
      'Block Players',
      'Player Device Info',
      'Transactions',
      'Game Transactions',
      'Game History',
      'Game Creation',
      'Create Game',
      'Manage Game',
      'Game Settings',
      'Winnings % Settings',
      'MBO Settings',
      'Create Mbo user',
      'User Mbo Settings',
      'Client Settings',
      'Create Client',
      'Client Management',
      'Admin Logs',
      'Website Maintainance',
      'Master CMS',
      'How to Play',
      'Rules',
      'Faq',
      'Terms & Condition',
      'Create Message',
      'Reports',
      'Player Report',
      'Daily Report',
      'Game Report',
      'Upline Settlement Report',
      'Live Player P&L',
    ]

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10)
      await Admin.create({
        phone_number: adminPhoneNumber,
        username: adminUsername,
        password: hashedPassword,
        role: constants.masterAdmin,
        permissions: permissions,
        parent_id: null,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      })
      logger.info('Admin user created successfully')
    } else {
      logger.info('Admin user already exists')
    }
  } catch (error) {
    logger.error(`Error: ${error}`)
  }
}

export { createAdminIfNotExists }
