import { Sequelize, ConnectionRefusedError } from 'sequelize'
import 'dotenv/config'

const environment = process.env.NODE_ENV

const sequelize = new Sequelize(process.env.POSTGRES_URL as string, {
  dialect: 'postgres',
  logging: false,
  define: {
    timestamps: true,
  },
  dialectOptions: {
    ssl:
      environment === 'local'
        ? false
        : {
            require: true,
            rejectUnauthorized: false,
          },
  },
})

async function connectDb(): Promise<void> {
  try {
    if (environment == 'PROD') {
      await sequelize.authenticate()
    } else {
      // await sequelize.authenticate()
      await sequelize.sync({ alter: true })
    }
  } catch (error) {
    if (error instanceof ConnectionRefusedError) {
      throw new Error(`Unable to connect Database:  ${error}`)
    } else {
      throw new Error(`Unexpected error:- ${error}`)
    }
  }
}

export { sequelize, connectDb }
