// Middleware buat RBAC
import type { Request, Response, NextFunction } from "express"
import type { Decrypted } from "../types/express"

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as Decrypted;

    if(!user){
      return res.status(401)
    }

    if (!allowedRoles.includes(user.role)){
      return res.status(403).json({
        message: 'Forbidden'
      })
    }

    next()
  }
}