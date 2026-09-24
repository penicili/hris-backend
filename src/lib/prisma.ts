import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { env } from '../config/env.js';

const adapter = new PrismaMariaDb({
  host: env.dbHost ?? 'localhost',
  port: Number(env.dbPort ?? 3306),
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  allowPublicKeyRetrieval: true
})

const prisma = new PrismaClient({ adapter })

export default prisma;