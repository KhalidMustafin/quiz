import { Router } from 'express';

export const sessionsRouter = Router();

sessionsRouter.get('/', (_req, res) => {
  res.json({ items: [], message: 'Sessions stub endpoint' });
});
