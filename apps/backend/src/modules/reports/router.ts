import { Router } from 'express';

export const reportsRouter = Router();

reportsRouter.get('/', (_req, res) => {
  res.json({ items: [], message: 'Reports stub endpoint' });
});
