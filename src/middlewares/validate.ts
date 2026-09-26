import type { NextFunction, Request, Response } from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'
import type { z, ZodType } from 'zod'

export type ValidateSource = 'body' | 'params' | 'query'

export type Validated<Schema extends ZodType> = z.infer<Schema>

/**
 * `req` narrowed on the source the schema was applied to, so chaining
 * `validate(bodySchema)` and `validate(paramSchema, 'params')` on one route does
 * not collapse into a single conflicting body type.
 */
export type ValidatedRequest<Schema extends ZodType, Source extends ValidateSource = 'body'> =
  Source extends 'body' ? Request<ParamsDictionary, Validated<Schema>>
  : Source extends 'params' ? Request<Validated<Schema>>
  : Request<ParamsDictionary, any, any, Validated<Schema>>

export function validate<Schema extends ZodType>(
  schema: Schema,
  source: 'body'
): (req: ValidatedRequest<Schema, 'body'>, res: Response, next: NextFunction) => void
export function validate<Schema extends ZodType>(
  schema: Schema,
  source: 'params'
): (req: ValidatedRequest<Schema, 'params'>, res: Response, next: NextFunction) => void
export function validate<Schema extends ZodType>(
  schema: Schema,
  source: 'query'
): (req: ValidatedRequest<Schema, 'query'>, res: Response, next: NextFunction) => void
export function validate<Schema extends ZodType>(
  schema: Schema,
  source?: ValidateSource
): (req: Request, res: Response, next: NextFunction) => void
export function validate<Schema extends ZodType>(
  schema: Schema,
  source: ValidateSource = 'body'
) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const result = schema.safeParse(req[source])

    if (!result.success) {
      return res.status(400).json({
        message: 'Invalid request',
        issues: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      })
    }

    if (source === 'body') {
      req.body = result.data
    } else if (source === 'params') {
      req.params = result.data as Record<string, string>
    }
    // `req.query` is a getter-only property in Express 5, so a validated query is
    // left as-is rather than written back

    next()
  }
}
