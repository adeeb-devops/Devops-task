import { Request as R } from 'express'

export interface GenericObject {
  [key: string]: any
}

export interface Request extends R {
  user?: GenericObject
}
