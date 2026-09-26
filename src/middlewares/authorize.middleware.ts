// Middleware buat RBAC
import type { Request, Response, NextFunction } from "express"
import type { UserRole } from "../generated/prisma/client.js"
import type { Decrypted } from "../types/express.js"

export const authorize = (allowedRoles: readonly UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as Decrypted;

    if(!user){
      return res.status(401).json({
        message: 'Unauthorized'
      })
    }

    if (!allowedRoles.includes(user.role)){
      return res.status(403).json({
        message: 'Forbidden'
      })
    }

    next()
  }
}
