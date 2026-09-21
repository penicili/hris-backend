import 'dotenv/config';



export const env = {
  dbHost: process.env.DB_HOST || 'localhost',
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_DATABASE,
  port: process.env.PORT|| '3000'
}