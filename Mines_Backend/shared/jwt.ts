import jwt from 'jsonwebtoken'
import { getEnv } from '../shared/env'

const env = getEnv()

export const createToken = async (user: any): Promise<string> => {
  try {
    const token = jwt.sign(user, env?.jwtSecretKey, {
      expiresIn: env.jwtExpiryTime,
    })

    return token
  } catch (error) {
    throw new Error(`Error creating token: ${(error as any).message}`)
  }
}

export const verifyToken = async (token: string): Promise<any> => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET)
    return decoded
  } catch (error) {
    throw new Error(`Error verifying token: ${(error as any).message}`)
  }
}
