import { Router } from 'express';

export const roomsRouter = Router();

roomsRouter.get('/', (_req, res) => {
  res.json({ items: [], message: 'Rooms stub endpoint' });
});
