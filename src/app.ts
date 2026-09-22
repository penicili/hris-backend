import express, { type Express, type Request, type Response } from 'express'
import { env } from './config/env.js'
import prisma from './lib/prisma.js'

const app: Express = express()



app.get('/', (req: Request, res: Response) => {
  res.json("OK")
})

const start = async () => {
  try {
    await prisma.$connect();
    console.log('Database Connected successfully')
    app.listen(env.port, () => console.log('App listening on', `http://${env.host}:${env.port}`))
  } catch (error) {
    console.log(`Startup error: ${error}`)
    process.exit(1);
  }
}

start()