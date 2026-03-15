import { Router } from 'express';

import { roomsService } from './service';

export const roomsRouter = Router();

function getUserContext(req: { header(name: string): string | undefined }) {
  const userId = req.header('x-user-id');
  const userName = req.header('x-user-name') ?? 'Player';

  return {
    userId,
    userName
  };
}

roomsRouter.get('/', (_req, res) => {
  res.json({ items: roomsService.listRooms() });
});

roomsRouter.get('/by-code/:code', (req, res) => {
  const room = roomsService.getRoomByCode(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'ROOM_NOT_FOUND' });
  }

  return res.json({ room });
});

roomsRouter.post('/', (req, res) => {
  const { userId, userName } = getUserContext(req);
  if (!userId) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'x-user-id header is required' });
  }

  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  if (!title) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'title is required' });
  }

  const room = roomsService.createRoom({ title, hostId: userId, hostName: userName });
  return res.status(201).json({ room });
});

roomsRouter.get('/:roomId', (req, res) => {
  const room = roomsService.getRoom(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'ROOM_NOT_FOUND' });
  }

  return res.json({ room });
});

roomsRouter.post('/:roomId/join', (req, res) => {
  const { userId, userName } = getUserContext(req);
  if (!userId) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'x-user-id header is required' });
  }

  const room = roomsService.joinRoom({ roomId: req.params.roomId, userId, displayName: userName });

  if (!room) {
    return res.status(404).json({ error: 'ROOM_NOT_FOUND' });
  }

  return res.json({ room });
});

roomsRouter.post('/join-by-code', (req, res) => {
  const { userId, userName } = getUserContext(req);
  if (!userId) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'x-user-id header is required' });
  }

  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  if (!code) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'code is required' });
  }

  const room = roomsService.joinRoomByCode({ code, userId, displayName: userName });

  if (!room) {
    return res.status(404).json({ error: 'ROOM_NOT_FOUND' });
  }

  return res.json({ room });
});

roomsRouter.post('/:roomId/start', (req, res) => {
  const { userId } = getUserContext(req);
  if (!userId) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'x-user-id header is required' });
  }

  const result = roomsService.startRoom({ roomId: req.params.roomId, requesterId: userId });

  if ('error' in result) {
    if (result.error === 'ROOM_NOT_FOUND') {
      return res.status(404).json({ error: result.error });
    }

    if (result.error === 'FORBIDDEN') {
      return res.status(403).json({ error: result.error, message: 'Only host can start the game' });
    }

    if (result.error === 'INSUFFICIENT_PLAYERS') {
      return res.status(409).json({ error: result.error, message: 'At least 2 players required to start' });
    }

    return res.status(409).json({ error: result.error, message: 'Room is not in lobby state' });
  }

  return res.status(201).json({ room: result.room, session: result.session });
});
