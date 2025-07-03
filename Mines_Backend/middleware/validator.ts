import { Request, Response, NextFunction } from 'express'

import Ajv, { ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import addErrors from 'ajv-errors'

export const ajvValidate = (req: Request, schema: any) => {
  const ajv = new Ajv({
    allErrors: true,
    strict: 'log',
  })
  addFormats(ajv)
  addErrors(ajv)
  const validate: ValidateFunction = ajv.compile(schema)
  return { valid: validate(req.body), validate }
}

export const requestValidator = (schema: any) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const { valid, validate } = ajvValidate(req, schema)

      if (!valid) {
        const message = validate.errors?.map((error: any) => error?.message)?.join(', ')
        const result = { success: false, error: message }

        return res.status(400).json(result)
      } else {
        return next()
      }
    } catch (error: any) {
      const result = { success: false, error: error?.message }

      return res.status(400).json(result)
    }
  }
}
