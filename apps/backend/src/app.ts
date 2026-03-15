import cors from 'cors';
import express from 'express';

import { env } from './config/env';
import { analyticsRouter } from './modules/analytics/router';
import { authRouter } from './modules/auth/router';
import { reportsRouter } from './modules/reports/router';
import { roomsRouter } from './modules/rooms/router';
import { sessionsRouter } from './modules/sessions/router';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'backend'
    });
  });

  app.use('/auth', authRouter);
  app.use('/rooms', roomsRouter);
  app.use('/sessions', sessionsRouter);
  app.use('/analytics', analyticsRouter);
  app.use('/reports', reportsRouter);

  return app;
}
