import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import { sanitize } from './shared/http-exception'
import requestLogger from './middleware/requestLogger'
import { logger } from './shared/logger'
import templateRoutes from './routes/template'
import adminRoutes from './routes/admin'
import maintenanceRoutes from './routes/maintenance'
import lobbysetting from './routes/setting'
import playerRoutes from './routes/player'
import distributorRoutes from './routes/distributor'
import managerRoutes from './routes/manager'
import cmsRoutes from './routes/cms'
import reportRoutes from './routes/report'
import gameRoutes from './routes/game'

const createServer = (): express.Application => {
  const app: Application = express()

  app.use(
    cors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    }),
  )

  app.use(express.json({ limit: '60mb' }))
  app.use(express.urlencoded({ extended: true }))

  app.use(requestLogger)
  app.use('/lobby', lobbysetting)
  app.use('/template', templateRoutes)
  app.use('/maintenance', maintenanceRoutes)
  app.use('/admin', adminRoutes)
  app.use('/distributor', distributorRoutes)
  app.use('/player', playerRoutes)
  app.use('/manager', managerRoutes)
  app.use('/cms', cmsRoutes)
  app.use('/report', reportRoutes)
  app.use('/game', gameRoutes)

  app.get('/', async (_req: Request, res: Response): Promise<Response> => {
    return res.status(200).send({
      success: true,
      message: 'The server is running',
    })
  })

  app.get('/health', async (_req: Request, res: Response): Promise<Response> => {
    return res.status(200).send({
      success: true,
      message: 'The server is running',
    })
  })

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err) {
      err = sanitize(err)
      logger.error(
        `Error: ====> ${JSON.stringify({
          status: false,
          message: err?.message || (typeof err == 'string' ? err : 'Something went wrong!'),
        })}`,
      )
      return res
        .status(err.status || 400)
        .json({ status: false, message: err?.message || (typeof err == 'string' ? err : 'Something went wrong!') })
    }

    return _next()
  })

  app.use('*', async (_req: Request, res: Response): Promise<Response> => {
    return res.status(404).send({
      success: false,
      message: 'URL_NOT_FOUND',
    })
  })

  return app
}

export default createServer
