import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import type { Decrypted } from '../../types/express.js'

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Unauthorized',
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, env.jwtSecret!) as Decrypted

    req.user = payload

    next()
  } catch {
    return res.status(401).json({
      message: 'Invalid or expired token',
    })
  }
}