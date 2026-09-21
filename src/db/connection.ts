import mysql from 'mysql2/promise'
import type { PoolOptions } from 'mysql2/promise'
import { env } from '../config/env.ts'



const access: PoolOptions = {
  user: env.dbUser,
  database: env.dbName,
  host: env.dbHost,
  password: env.dbPassword
}

export const conn = mysql.createPool(access)