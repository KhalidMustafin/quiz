import { Router } from 'express';

export const analyticsRouter = Router();

analyticsRouter.get('/', (_req, res) => {
  res.json({ items: [], message: 'Analytics stub endpoint' });
});
