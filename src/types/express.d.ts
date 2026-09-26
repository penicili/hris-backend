import type { UserRole } from '../generated/prisma/enums.js'

export interface Decrypted {
  userId: number,
  role: UserRole
}
declare global {
  namespace Express{
    interface Request{
      user?: Decrypted
    }
  }
}

export {}
