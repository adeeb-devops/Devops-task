import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Request } from '../interfaces/generic'
import { getEnv } from '../shared/env'
import { getDistributorData } from '../shared/utils'

const env = getEnv()

export const authenticateJwtToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).send({ success: false, message: 'Token missing' })

  try {
    const decoded: any = jwt.verify(token, env.jwtSecretKey)

    if (decoded?.role == 'manager') {
      const distributor = await getDistributorData(decoded?.distributor_id)
      if (!distributor) {
        return res.status(404).send({ success: false, message: 'Distributor not found' })
      }

      req.user = distributor
    } else {
      req.user = decoded
    }

    next()
  } catch (error) {
    return res.status(403).send({ success: false, message: 'Invalid jwt token' })
  }
}

export const authenticateSocketJwtToken = (token: string) => {
  try {
    jwt.verify(token, env.jwtSecretKey)
    return true
  } catch (err) {
    return false
  }
}

export const authenticateTokenCms = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  const authHeader = req.headers['authorization']
  let token: string | undefined = authHeader && authHeader.split(' ')[1]

  if (!token) {
    token = String(req.headers['token'])
    if (token && token === env.authenticationToken) {
      return next()
    }

    if (!token) return res.status(401).send({ success: false, message: 'Token missing' })

    return res.status(401).send({ success: false, message: 'Incorrect token' })
  }

  jwt.verify(token, env.jwtSecretKey, async (err: any, decoded: any) => {
    if (err) {
      return res.status(403).send({ success: false, message: 'Invalid jwt token' })
    }

    req.user = decoded
    return next()
  })
}
