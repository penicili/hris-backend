import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { env } from '../config/env';

const adapter = new PrismaMariaDb({
  host: env.dbHost ?? 'localhost',
  port: Number (env.dbPort) ?? 3306,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
})

const prisma = new PrismaClient({adapter})

export default prisma;