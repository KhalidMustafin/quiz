import { Router } from 'express';

import { sendError } from '../../http';
import { roomsService } from '../rooms/service';

export const sessionsRouter = Router();

sessionsRouter.get('/', (_req, res) => {
  res.json({ items: roomsService.listSessions() });
});

sessionsRouter.get('/:sessionId', (req, res) => {
  const session = roomsService.getSession(req.params.sessionId);

  if (!session) {
    return sendError(res, 404, 'SESSION_NOT_FOUND');
  }

  return res.json({ session });
});
