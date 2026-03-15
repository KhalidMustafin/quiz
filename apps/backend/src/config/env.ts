import dotenv from 'dotenv';

dotenv.config({ path: process.env.ENV_FILE || '../../env.example' });

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://quiz:quiz@localhost:5432/quiz',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173'
};
