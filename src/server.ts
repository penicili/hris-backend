import { app } from './app.js';
import { env } from './config/env.js';
import prisma from './lib/prisma.js';

const start = async () => {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;

    app.listen(env.port, () => {
      console.log(`App listening on http://${env.host}:${env.port}`);
    });
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
};

// TODO: setup test db
start();