import type { NextFunction, Request, Response } from 'express'
import type { z, ZodType } from 'zod'

export type ValidateSource = 'body' | 'params' | 'query'

export type Validated<Schema extends ZodType> = z.infer<Schema>

export type ValidatedRequest<Schema extends ZodType> = Request<
  Record<string, string>,
  any,
  Validated<Schema>
>

export const validate =
  <Schema extends ZodType>(schema: Schema, source: ValidateSource = 'body') =>
  (
    req: Request<Record<string, string>, any, Validated<Schema>>,
    res: Response,
    next: NextFunction
  ) => {
    const result = schema.safeParse(req[source])

    if (!result.success) {
      return res.status(400).json({
        message: 'Invalid request',
      })
    }

    if (source === 'body') {
      req.body = result.data
    } else if (source === 'params') {
      req.params = result.data as Record<string, string>
    }

    next()
  }
