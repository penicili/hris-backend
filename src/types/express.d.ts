export interface Decrypted {
  userId: number,
  role: string
}
declare global {
  namespace Express{
    interface Request{
      user?: Decrypted
    }
  }
}

export {}