import { Request, Response, NextFunction } from 'express'
import { logger } from '../shared/logger'

const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  const { method, url } = req

  logger.info(`Request received: ${method} - ${url}`)
  next()
}

export default requestLogger
