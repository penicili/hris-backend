import express, {type Express, type Request, type Response} from 'express'
import {env} from './config/env.js'

const app: Express = express()



app.get('/', (req: Request, res: Response) => {
  res.json("OK")
})

app.listen(env.port, () => {
  console.log(`Server jalan di port ${env.port}`)
})