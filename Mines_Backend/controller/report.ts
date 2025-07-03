import { Response } from 'express'
import { Request } from '../interfaces/generic'
import { Player, Distributor, Transaction, Game, Template } from '../config/index'
import { Op } from 'sequelize'
import { sequelize } from '../config/db'

const controller = {
  // User report
  getUserReport: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      // superDistributorName,
      const {
        startDate,
        endDate,
        playerName,
        phoneNumber,
        status,
        limit,
        offset,
        playerType,
        superName,
        downlineName,
      }: any = req.query

      const limitValue = limit ? parseInt(limit as string, 10) : 10
      const offsetValue = offset ? parseInt(offset as string, 10) : 0

      // Query filters
      let whereClause: any = {}
      const superDistClause: any = {}

      let roleAs = undefined
      let roleAsMapped: any = undefined

      if (req.user?.role !== 'master_admin' && req.user?.role !== 'admin') {
        const role = req.user?.role
        const distributor: any = await Distributor.findOne({
          where: { distributor_id: req.user?.distributor_id },
          attributes: ['id', 'role', 'distributor_id'], // Fetch distributor's role and id
        })

        // for manager
        if (role === 'manager') {
          // For manager, first find the distributor details

          if (distributor) {
            // Use distributor's role and id similar to playerClause logic
            whereClause = {
              [distributor.role]: distributor.distributor_id, // Use distributor's role and id
            }
          }
        } else {
          // for distributor
          whereClause = {
            [role]: req.user?.distributor_id,
          }
        }

        // Fetch the children (downline) distributors
        const childrenDistributors: any = await Distributor.findAll({
          where: { parent_id: distributor.id }, // Find distributors where parent_id matches
          attributes: ['role', 'distributor_id'], // Get the children's role and id
        })

        if (childrenDistributors.length > 0) {
          roleAs = childrenDistributors[0]?.role

          // Build a condition for all child distributors based on their role and id
          const downlineWhereConditions = childrenDistributors.map((child: any) => ({
            [child.role]: child.distributor_id,
          }))

          if (whereClause) {
            whereClause = {
              [Op.or]: [
                whereClause, // Existing condition
                ...downlineWhereConditions, // Append downline conditions
              ],
            }
          } else {
            // If whereClause is empty, assign only downline conditions
            whereClause = {
              [Op.or]: downlineWhereConditions,
            }
          }
        }

        const roleMapping: any = {
          super_distributor: 'playerSuperDistributor',
          distributor: 'playerDistributor',
          sub_distributor: 'playerSubDistributor',
          retailer: 'playerRetailer',
        }

        roleAsMapped = roleMapping[roleAs]
      }

      if (startDate && endDate) {
        whereClause.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] }
      }

      if (playerName) whereClause.player_name = { [Op.like]: `%${playerName}%` }
      if (status) whereClause.status = status
      if (phoneNumber) whereClause.phone_number = phoneNumber
      if (playerType) whereClause.player_type = playerType
      if (superName) superDistClause.name = { [Op.like]: `%${superName}%` }

      const groupAttributes = [
        'Player.id',
        'playerSuperDistributor.name',
        'playerSuperDistributor.sharing_type',
        sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'self')::numeric`),
        sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'client')::numeric`),
      ]

      if (roleAsMapped) {
        groupAttributes.push(`${roleAsMapped}.name`)
        groupAttributes.push(`${roleAsMapped}.role`)
      }

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
              'sharing_type',
              [sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'self')::numeric`), 'self'],
              [sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'client')::numeric`), 'client'],
            ],
          },
          ...(roleAsMapped
            ? [
                {
                  model: Distributor,
                  as: roleAsMapped, // e.g., 'superDistributor', 'distributor', etc.
                  where: downlineName ? { name: { [Op.like]: `%${downlineName}%` } } : undefined, // Downline name filter
                  attributes: ['name', 'role'], // Add other fields as needed
                },
              ]
            : []),
          {
            model: Transaction,
            as: 'transactions',
            attributes: [
              [
                sequelize.fn(
                  'SUM',
                  sequelize.literal(
                    `CASE WHEN "transactions"."transaction_type" = 'bet-win' THEN "transactions"."betting_amount" ELSE 0 END`,
                  ),
                ),
                'total_buy_in',
              ],
              [
                sequelize.fn(
                  'SUM',
                  sequelize.literal(
                    `CASE WHEN "transactions"."transaction_type" = 'bet-win' THEN "transactions"."winning_amount" ELSE 0 END`,
                  ),
                ),
                'total_buy_out',
              ],
            ],
          },
        ],
        attributes: [
          'id',
          'player_name',
          'status',
          'phone_number',
          'balance',
          'created_at',
          'player_type',
          'created_at',
          'last_login',
          [
            sequelize.literal(`COALESCE(SUM(
            CASE WHEN transactions.transaction_type = 'bet-win' 
            THEN transactions.winning_amount - transactions.betting_amount 
            ELSE 0 
            END
          ), 0)`),
            'pl',
          ],
          [
            sequelize.literal(`(
            COALESCE(SUM(
              CASE WHEN transactions.transaction_type = 'bet-win' 
              THEN transactions.winning_amount 
              ELSE 0 END
            ), 0)
            *
            (COALESCE(("playerSuperDistributor"."sharing_percentage"->>'client')::numeric, 0)) / 100
          )`),
            'commission',
          ],
          [
            sequelize.literal(`
            COALESCE(SUM(
              CASE WHEN transactions.transaction_type = 'bet-win' 
              THEN transactions.winning_amount - transactions.betting_amount 
              ELSE 0 END
            ), 0) - 
            (
              COALESCE(SUM(
                CASE WHEN transactions.transaction_type = 'bet-win' 
                THEN transactions.winning_amount 
                ELSE 0 END
              ), 0)
              *
              COALESCE(("playerSuperDistributor"."sharing_percentage"->>'client')::numeric, 0) / 100
            )
          `),
            'netPl',
          ], // Net Profit/Loss
        ],
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

  // Daily report
  getDailyReport: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const {
        startDate,
        endDate,
        playerName,
        phoneNumber,
        status,
        limit,
        offset,
        playerType,
        superName,
        downlineName,
      }: any = req.query

      const limitValue = limit ? parseInt(limit as string, 10) : 10
      const offsetValue = offset ? parseInt(offset as string, 10) : 0

      // Query filters
      let whereClause: any = {}
      const superDistClause: any = {}

      let roleAs = undefined
      let roleAsMapped: any = undefined

      if (req.user?.role !== 'master_admin' && req.user?.role !== 'admin') {
        const role = req.user?.role
        const distributor: any = await Distributor.findOne({
          where: { distributor_id: req.user?.distributor_id },
          attributes: ['id', 'role', 'distributor_id'], // Fetch distributor's role and id
        })

        // for manager
        if (role === 'manager') {
          // For manager, first find the distributor details

          if (distributor) {
            // Use distributor's role and id similar to playerClause logic
            whereClause = {
              [distributor.role]: distributor.distributor_id, // Use distributor's role and id
            }
          }
        } else {
          // for distributor
          whereClause = {
            [role]: req.user?.distributor_id,
          }
        }

        // Fetch the children (downline) distributors
        const childrenDistributors: any = await Distributor.findAll({
          where: { parent_id: distributor.id }, // Find distributors where parent_id matches
          attributes: ['role', 'distributor_id'], // Get the children's role and id
        })

        if (childrenDistributors.length > 0) {
          roleAs = childrenDistributors[0]?.role

          // Build a condition for all child distributors based on their role and id
          const downlineWhereConditions = childrenDistributors.map((child: any) => ({
            [child.role]: child.distributor_id,
          }))

          if (whereClause) {
            whereClause = {
              [Op.or]: [
                whereClause, // Existing condition
                ...downlineWhereConditions, // Append downline conditions
              ],
            }
          } else {
            // If whereClause is empty, assign only downline conditions
            whereClause = {
              [Op.or]: downlineWhereConditions,
            }
          }
        }

        const roleMapping: any = {
          super_distributor: 'playerSuperDistributor',
          distributor: 'playerDistributor',
          sub_distributor: 'playerSubDistributor',
          retailer: 'playerRetailer',
        }

        roleAsMapped = roleMapping[roleAs]
      }

      if (startDate && endDate) {
        whereClause.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] }
      }

      if (playerName) whereClause.player_name = { [Op.like]: `%${playerName}%` }
      if (status) whereClause.status = status
      if (phoneNumber) whereClause.phone_number = phoneNumber
      if (playerType) whereClause.player_type = playerType
      if (superName) superDistClause.name = { [Op.like]: `%${superName}%` }

      const groupAttributes = [
        'Player.id',
        'playerSuperDistributor.name',
        'playerSuperDistributor.sharing_type',
        sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'self')::numeric`),
        sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'client')::numeric`),
      ]

      if (roleAsMapped) {
        groupAttributes.push(`${roleAsMapped}.name`)
        groupAttributes.push(`${roleAsMapped}.role`)
      }

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
              'sharing_type',
              [sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'self')::numeric`), 'self'],
              [sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'client')::numeric`), 'client'],
            ],
          },
          ...(roleAsMapped
            ? [
                {
                  model: Distributor,
                  as: roleAsMapped, // e.g., 'superDistributor', 'distributor', etc.
                  where: downlineName ? { name: { [Op.like]: `%${downlineName}%` } } : undefined, // Downline name filter
                  attributes: ['name', 'role'], // Add other fields as needed
                },
              ]
            : []),
          {
            model: Transaction,
            as: 'transactions',
            attributes: [
              [
                sequelize.fn(
                  'SUM',
                  sequelize.literal(
                    `CASE WHEN "transactions"."transaction_type" = 'bet-win' THEN "transactions"."betting_amount" ELSE 0 END`,
                  ),
                ),
                'total_buy_in',
              ],
              [
                sequelize.fn(
                  'SUM',
                  sequelize.literal(
                    `CASE WHEN "transactions"."transaction_type" = 'bet-win' THEN "transactions"."winning_amount" ELSE 0 END`,
                  ),
                ),
                'total_buy_out',
              ],
            ],
          },
        ],
        attributes: [
          'id',
          'player_name',
          'status',
          'phone_number',
          'balance',
          'created_at',
          'player_type',
          'created_at',
          'last_login',
        ],
        group: groupAttributes,
        order: [['created_at', 'DESC']],
        raw: true,
        subQuery: false,
      })

      // Format data into a report structure
      const reportData = userReports.rows.map((player: any, index: number) => {
        const totalBuyIn = parseFloat(player['Transactions.total_buy_in']) || 0
        const totalBuyOut = parseFloat(player['Transactions.total_buy_out']) || 0
        const pl = totalBuyOut - totalBuyIn // P&L

        const clientPercentage = parseFloat(player['playerSuperDistributor.client']) || 0
        const commissionAmount = (Math.abs(totalBuyOut) * clientPercentage) / 100
        const netPl = pl - commissionAmount

        const currentDate = new Date()
        const istDate = new Date(currentDate.getTime() + 5.5 * 60 * 60 * 1000)

        return {
          srNo: index + 1,
          userId: player.id,
          playerName: player.player_name,
          phoneNumber: player.phone_number,
          status: player.status,
          balance: player.balance.toFixed(2),
          playerType: player.player_type,
          registration_date: player.created_at,
          lastActive: player.last_login,
          superDistributorName: player['playerSuperDistributor.name'], // Super distributor name
          totalBuyIn: totalBuyIn.toFixed(2),
          totalBuyOut: totalBuyOut.toFixed(2),
          totalCommission: commissionAmount.toFixed(2),
          netPl: netPl.toFixed(2),
          downlineName: player[`${roleAsMapped}.name`] || 'N/A',
          reportDate: istDate,
        }
      })

      return res.status(200).json({
        success: true,
        data: {
          count: userReports?.count?.length,
          rows: reportData,
        },
      })
    } catch (e: any) {
      return res.status(400).json({ error: false, message: e?.message })
    }
  },

  // Game report
  getGameReport: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const {
        startDate,
        endDate,
        playerName,
        phoneNumber,
        status,
        limit,
        offset,
        playerType,
        superName,
        downlineName,
        gameType,
        gridType, // 25, 49, 81
      }: any = req.query

      const limitValue = limit ? parseInt(limit as string, 10) : 10
      const offsetValue = offset ? parseInt(offset as string, 10) : 0

      // Query filters
      let whereClause: any = {}
      const superDistClause: any = {}
      const gameWhereClause: any = {}
      const templateWhereClause: any = {}

      let roleAs = undefined
      let roleAsMapped: any = undefined

      if (req.user?.role !== 'master_admin' && req.user?.role !== 'admin') {
        const role = req.user?.role
        const distributor: any = await Distributor.findOne({
          where: { distributor_id: req.user?.distributor_id },
          attributes: ['id', 'role', 'distributor_id'], // Fetch distributor's role and id
        })

        // for manager
        if (role === 'manager') {
          // For manager, first find the distributor details

          if (distributor) {
            // Use distributor's role and id similar to playerClause logic
            whereClause = {
              [distributor.role]: distributor.distributor_id, // Use distributor's role and id
            }
          }
        } else {
          // for distributor
          whereClause = {
            [role]: req.user?.distributor_id,
          }
        }

        // Fetch the children (downline) distributors
        const childrenDistributors: any = await Distributor.findAll({
          where: { parent_id: distributor.id }, // Find distributors where parent_id matches
          attributes: ['role', 'distributor_id'], // Get the children's role and id
        })

        if (childrenDistributors.length > 0) {
          roleAs = childrenDistributors[0]?.role

          // Build a condition for all child distributors based on their role and id
          const downlineWhereConditions = childrenDistributors.map((child: any) => ({
            [child.role]: child.distributor_id,
          }))

          if (whereClause) {
            whereClause = {
              [Op.or]: [
                whereClause, // Existing condition
                ...downlineWhereConditions, // Append downline conditions
              ],
            }
          } else {
            // If whereClause is empty, assign only downline conditions
            whereClause = {
              [Op.or]: downlineWhereConditions,
            }
          }
        }

        const roleMapping: any = {
          super_distributor: 'playerSuperDistributor',
          distributor: 'playerDistributor',
          sub_distributor: 'playerSubDistributor',
          retailer: 'playerRetailer',
        }

        roleAsMapped = roleMapping[roleAs]
      }

      if (startDate && endDate) {
        whereClause.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] }
      }

      if (playerName) whereClause.player_name = { [Op.like]: `%${playerName}%` }
      if (status) whereClause.status = status
      if (phoneNumber) whereClause.phone_number = phoneNumber
      if (playerType) whereClause.player_type = playerType
      if (superName) superDistClause.name = { [Op.like]: `%${superName}%` }
      // if (gameType) {
      //   templateWhereClause.game_name = gameType
      // }
      if (gameType) {
        templateWhereClause.is_jackpot = gameType
      }

      if (gridType) {
        gameWhereClause.tiles_count = gridType
      }

      const groupAttributes = [
        'Player.id',
        'playerSuperDistributor.name',
        'playerSuperDistributor.sharing_type',
        sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'self')::numeric`),
        sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'client')::numeric`),
        'transactions->gameTransaction.id',
        'transactions->gameTransaction->template.id',
      ]

      if (roleAsMapped) {
        groupAttributes.push(`${roleAsMapped}.name`)
        groupAttributes.push(`${roleAsMapped}.role`)
      }

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
              'sharing_type',
              [sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'self')::numeric`), 'self'],
              [sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'client')::numeric`), 'client'],
            ],
          },
          ...(roleAsMapped
            ? [
                {
                  model: Distributor,
                  as: roleAsMapped, // e.g., 'superDistributor', 'distributor', etc.
                  where: downlineName ? { name: { [Op.like]: `%${downlineName}%` } } : undefined, // Downline name filter
                  attributes: ['name', 'role'], // Add other fields as needed
                },
              ]
            : []),
          {
            model: Transaction,
            as: 'transactions',
            required: true,
            include: [
              {
                model: Game,
                as: 'gameTransaction',
                where: gameWhereClause,
                include: [
                  {
                    model: Template,
                    as: 'template',
                    where: templateWhereClause,
                    attributes: ['game_name', 'is_jackpot'], // Add fields needed from Template
                  },
                ],
                attributes: ['game_id', 'tiles_count'], // Add fields needed from Game
              },
            ],
            attributes: [
              [
                sequelize.fn(
                  'SUM',
                  sequelize.literal(
                    `CASE WHEN "transactions"."transaction_type" = 'bet-win' THEN "transactions"."betting_amount" ELSE 0 END`,
                  ),
                ),
                'total_buy_in',
              ],
              [
                sequelize.fn(
                  'SUM',
                  sequelize.literal(
                    `CASE WHEN "transactions"."transaction_type" = 'bet-win' THEN "transactions"."winning_amount" ELSE 0 END`,
                  ),
                ),
                'total_buy_out',
              ],
            ],
          },
        ],
        attributes: [
          'id',
          'player_name',
          'status',
          'phone_number',
          'balance',
          'created_at',
          'player_type',
          'created_at',
          'last_login',
          [
            sequelize.literal(
              `COALESCE(SUM(CASE WHEN "transactions"."transaction_type" = 'bet-win' THEN "transactions"."winning_amount" ELSE 0 END), 0) 
              - COALESCE(SUM(CASE WHEN "transactions"."transaction_type" = 'bet-win' THEN "transactions"."betting_amount" ELSE 0 END), 0)`,
            ),
            'pl', // Profit & Loss
          ],
          [
            sequelize.literal(
              `((COALESCE(SUM(CASE WHEN "transactions"."transaction_type" = 'bet-win' THEN "transactions"."winning_amount" ELSE 0 END), 0)) 
              * COALESCE(("playerSuperDistributor"."sharing_percentage"->>'client')::numeric, 0) / 100)`,
            ),
            'commission_amount',
          ],
          [
            sequelize.literal(
              `COALESCE(SUM(CASE WHEN "transactions"."transaction_type" = 'bet-win' THEN "transactions"."winning_amount" ELSE 0 END), 0) 
              / NULLIF(COALESCE(SUM(CASE WHEN "transactions"."transaction_type" = 'bet-win' THEN "transactions"."betting_amount" ELSE 0 END), 1), 0) * 100`,
            ),
            'payout_percentage',
          ],
          [
            sequelize.literal(
              `COALESCE(SUM(CASE WHEN "transactions"."transaction_type" = 'bet-win' THEN "transactions"."winning_amount" ELSE 0 END), 0) 
              - COALESCE(SUM(CASE WHEN "transactions"."transaction_type" = 'bet-win' THEN "transactions"."betting_amount" ELSE 0 END), 0)
              - ((COALESCE(SUM(CASE WHEN "transactions"."transaction_type" = 'bet-win' THEN "transactions"."winning_amount" ELSE 0 END), 0)) 
              * COALESCE(("playerSuperDistributor"."sharing_percentage"->>'client')::numeric, 0) / 100)`,
            ),
            'net_pl', // Net Profit & Loss after commission
          ],
        ],
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

  // Downline Reports
  getDownlineSettlementReport: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const {
        startDate,
        endDate,
        playerName,
        playerType,
        phoneNumber,
        superDistributorName,
        sharingType,
        limit,
        offset,
        gameType,
      }: any = req.query
      const limitValue = limit ? parseInt(limit as string, 10) : 10
      const offsetValue = offset ? parseInt(offset as string, 10) : 0

      // Query filters
      const whereClause: any = {}
      const distributorWhereClause: any = {}
      const gameWhereClause: any = {}

      if (startDate && endDate) {
        whereClause.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] }
      }

      if (playerName) whereClause.player_name = { [Op.like]: `%${playerName}%` }
      if (phoneNumber) whereClause.phone_number = phoneNumber
      if (playerType) whereClause.player_type = playerType
      if (superDistributorName) {
        distributorWhereClause.name = superDistributorName // Filter by super distributor name
      }

      if (sharingType) {
        distributorWhereClause['sharing_type'] = sharingType // Filter by sharing type (exact match)
      }

      // if (gameType) {
      //   gameWhereClause.game_name = gameType
      // }

      if (gameType) {
        gameWhereClause.is_jackpot = gameType
      }

      // Fetch user report data
      const settlementReports = await Player.findAndCountAll({
        where: whereClause,
        limit: limitValue,
        offset: offsetValue,
        include: [
          {
            model: Distributor,
            where: distributorWhereClause,
            as: 'playerSuperDistributor',
            attributes: [
              'name',
              'sharing_type',
              [sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'self')::numeric`), 'self'],
              [sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'client')::numeric`), 'client'],
            ],
          },
          {
            model: Transaction,
            as: 'transactions',
            required: true,
            include: [
              {
                model: Game,
                as: 'gameTransaction',
                include: [
                  {
                    model: Template,
                    as: 'template',
                    where: gameWhereClause,
                    attributes: ['game_name', 'is_jackpot'], // Add fields needed from Template
                  },
                ],
                attributes: ['game_id'], // Add fields needed from Game
              },
            ],
            attributes: [
              [
                sequelize.fn(
                  'SUM',
                  sequelize.literal(
                    `CASE WHEN "transactions"."transaction_type" = 'bet-win' THEN "transactions"."betting_amount" ELSE 0 END`,
                  ),
                ),
                'total_buy_in',
              ],
              [
                sequelize.fn(
                  'SUM',
                  sequelize.literal(
                    `CASE WHEN "transactions"."transaction_type" = 'bet-win' THEN "transactions"."winning_amount" ELSE 0 END`,
                  ),
                ),
                'total_buy_out',
              ],
              [
                sequelize.literal(
                  `SUM(CASE WHEN "transactions"."transaction_type" = 'bet-win' 
                        THEN "transactions"."winning_amount" - "transactions"."betting_amount" 
                        ELSE 0 END)`,
                ),
                'pl',
              ],
            ],
          },
        ],
        attributes: [
          'id',
          'player_name',
          'created_at',
          'phone_number',
          'player_type',
          [
            sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'client')::numeric`),
            'clientPercentage',
          ],
          [
            sequelize.literal(`
              CASE 
                WHEN "playerSuperDistributor"."sharing_type" = 'Turnover' 
                  THEN (SUM("transactions"."betting_amount") * ("playerSuperDistributor"."sharing_percentage"->>'client')::numeric) / 100
                WHEN "playerSuperDistributor"."sharing_type" = 'Commission' 
                  THEN (SUM(ABS("transactions"."winning_amount")) * ("playerSuperDistributor"."sharing_percentage"->>'client')::numeric) / 100
                WHEN "playerSuperDistributor"."sharing_type" = 'P&L' 
                  THEN (SUM("transactions"."winning_amount" - "transactions"."betting_amount") * ("playerSuperDistributor"."sharing_percentage"->>'client')::numeric) / 100
                WHEN "playerSuperDistributor"."sharing_type" = 'P&L & Commission' 
                  THEN ((SUM("transactions"."winning_amount" - "transactions"."betting_amount") + SUM(ABS("transactions"."winning_amount"))) * ("playerSuperDistributor"."sharing_percentage"->>'client')::numeric) / 100
                ELSE 0
              END
            `),
            'toGive',
          ],
        ],
        group: [
          'Player.id',
          'playerSuperDistributor.name',
          'playerSuperDistributor.sharing_type',
          sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'self')::numeric`),
          sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'client')::numeric`),
          'transactions->gameTransaction.id',
          'transactions->gameTransaction->template.id',
        ],
        order: [['created_at', 'DESC']],
        raw: true,
        subQuery: false,
      })

      return res.status(200).json({
        success: true,
        data: {
          count: settlementReports?.count?.length,
          rows: settlementReports.rows,
        },
      })
    } catch (e: any) {
      return res.status(400).json({ error: false, message: e?.message })
    }
  },

  // Upline Reports
  getUplineSettlementReport: async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const {
        startDate,
        endDate,
        playerName,
        playerType,
        phoneNumber,
        superDistributorName,
        sharingType,
        limit,
        offset,
        gameType,
      }: any = req.query
      const limitValue = limit ? parseInt(limit as string, 10) : 10
      const offsetValue = offset ? parseInt(offset as string, 10) : 0
      const role = req.user?.role
      let uplineName: any

      // Query filters
      let whereClause: any = {}
      const distributorWhereClause: any = {}
      const gameWhereClause: any = {}

      if (role == 'super_distributor') {
        uplineName = req.user?.created_by_admin
      } else {
        // Fetch the current distributor's parent
        const distributorWithParent: any = await Distributor.findOne({
          where: { distributor_id: req.user?.distributor_id },
          include: [
            {
              model: Distributor,
              as: 'parent', // Use the 'parent' association
              attributes: ['role', 'distributor_id', 'name'], // Get parent's role and id
            },
          ],
          attributes: ['distributor_id', 'role'], // Fetch current distributor's details
        })

        if (distributorWithParent?.parent) {
          uplineName = distributorWithParent.parent.name
          // Set the whereClause based on parent distributor's role and id
          whereClause = {
            [distributorWithParent.parent.role]: distributorWithParent.parent.distributor_id,
          }
        } else {
          throw new Error('Parent distributor not found')
        }
      }

      if (startDate && endDate) {
        whereClause.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] }
      }

      if (playerName) whereClause.player_name = { [Op.like]: `%${playerName}%` }
      if (phoneNumber) whereClause.phone_number = phoneNumber
      if (playerType) whereClause.player_type = playerType
      if (superDistributorName) {
        distributorWhereClause.name = superDistributorName // Filter by super distributor name
      }

      if (sharingType) {
        distributorWhereClause['sharing_type'] = sharingType // Filter by sharing type (exact match)
      }

      // if (gameType) {
      //   gameWhereClause.game_name = gameType
      // }

      if (gameType) {
        gameWhereClause.is_jackpot = gameType
      }

      // Fetch user report data
      const settlementReports = await Player.findAndCountAll({
        where: whereClause,
        limit: limitValue,
        offset: offsetValue,
        include: [
          {
            model: Distributor,
            where: distributorWhereClause,
            as: 'playerSuperDistributor',
            attributes: [
              'name',
              'sharing_type',
              [sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'self')::numeric`), 'self'],
              [sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'client')::numeric`), 'client'],
            ],
          },
          {
            model: Transaction,
            as: 'transactions',
            required: true,
            include: [
              {
                model: Game,
                as: 'gameTransaction',
                include: [
                  {
                    model: Template,
                    as: 'template',
                    where: gameWhereClause,
                    attributes: ['game_name', 'is_jackpot'], // Add fields needed from Template
                  },
                ],
                attributes: ['template_id', 'game_id'], // Add fields needed from Game
              },
            ],
            attributes: [
              [
                sequelize.fn(
                  'SUM',
                  sequelize.literal(
                    `CASE WHEN "transactions"."transaction_type" = 'bet-win' THEN "transactions"."betting_amount" ELSE 0 END`,
                  ),
                ),
                'total_buy_in',
              ],
              [
                sequelize.fn(
                  'SUM',
                  sequelize.literal(
                    `CASE WHEN "transactions"."transaction_type" = 'bet-win' THEN "transactions"."winning_amount" ELSE 0 END`,
                  ),
                ),
                'total_buy_out',
              ],
            ],
          },
        ],
        attributes: ['id', 'player_name', 'phone_number', 'player_type', 'created_at'],
        group: [
          'Player.id',
          'playerSuperDistributor.name',
          'playerSuperDistributor.sharing_type',
          sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'self')::numeric`),
          sequelize.literal(`("playerSuperDistributor"."sharing_percentage"->>'client')::numeric`),
          'transactions->gameTransaction.id',
          'transactions->gameTransaction->template.id',
        ],
        order: [['created_at', 'DESC']],
        raw: true,
        subQuery: false,
      })

      // Format data into a report structure
      const reportData = settlementReports.rows.map((player: any, index: number) => {
        const totalBuyIn = parseFloat(player['transactions.total_buy_in']) || 0
        const totalBuyOut = parseFloat(player['transactions.total_buy_out']) || 0
        const pl = totalBuyOut - totalBuyIn

        const selfPercentage = parseFloat(player['playerSuperDistributor.self']) || 0
        const clientPercentage = parseFloat(player['playerSuperDistributor.client']) || 0
        const commissionAmount = (Math.abs(totalBuyOut) * clientPercentage) / 100
        const netPl = pl - commissionAmount

        const toGive = 0
        let toTake = 0
        const shareType = player['playerSuperDistributor.sharing_type']
        // Sharing type logic
        if (shareType === 'turnover') {
          toTake = (totalBuyIn * clientPercentage) / 100
        } else if (shareType === 'commission') {
          toTake = (commissionAmount * clientPercentage) / 100
        } else if (shareType === 'plsharing') {
          toTake = (netPl * clientPercentage) / 100
        } else if (shareType === 'plsharing & Commission') {
          const total = netPl + commissionAmount
          toTake = (total * clientPercentage) / 100
        }

        return {
          srNo: index + 1,
          playerName: player.player_name,
          phoneNumber: player.phone_number,
          playerType: player.player_type,
          created_at: player.created_at,
          gameType: player['transactions.gameTransaction.template.game_name'],
          uplineName: uplineName,
          totalBuyIn: totalBuyIn.toFixed(2),
          totalBuyOut: totalBuyOut.toFixed(2),
          totalCommission: commissionAmount.toFixed(2),
          netPl: netPl.toFixed(2),
          sharingType: shareType,
          selfPercentage: selfPercentage,
          uplinePercentage: clientPercentage,
          toGive: toGive.toFixed(2),
          toTake: toTake.toFixed(2),
        }
      })

      return res.status(200).json({
        success: true,
        data: {
          count: settlementReports?.count?.length,
          rows: reportData,
        },
      })
    } catch (e: any) {
      return res.status(400).json({ error: false, message: e?.message })
    }
  },
}

export default controller
