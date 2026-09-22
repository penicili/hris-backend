import 'dotenv/config';



export const env = {
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: process.env.DB_PORT || '3306',
  dbUser: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_DATABASE,
  port: process.env.APP_PORT || '3000',
  host: process.env.APP_HOST || 'localhost'
}