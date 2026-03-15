import { Router } from 'express';

import { sendError } from '../../http';
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
    return sendError(res, 404, 'ROOM_NOT_FOUND');
  }

  return res.json({ room });
});

roomsRouter.post('/', (req, res) => {
  const { userId, userName } = getUserContext(req);
  if (!userId) {
    return sendError(res, 401, 'UNAUTHORIZED', { message: 'x-user-id header is required' });
  }

  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  if (!title) {
    return sendError(res, 400, 'VALIDATION_ERROR', { message: 'title is required' });
  }

  const room = roomsService.createRoom({ title, hostId: userId, hostName: userName });
  return res.status(201).json({ room });
});

roomsRouter.get('/:roomId', (req, res) => {
  const room = roomsService.getRoom(req.params.roomId);
  if (!room) {
    return sendError(res, 404, 'ROOM_NOT_FOUND');
  }

  return res.json({ room });
});

roomsRouter.post('/:roomId/join', (req, res) => {
  const { userId, userName } = getUserContext(req);
  if (!userId) {
    return sendError(res, 401, 'UNAUTHORIZED', { message: 'x-user-id header is required' });
  }

  const room = roomsService.joinRoom({ roomId: req.params.roomId, userId, displayName: userName });

  if ('error' in room) {
    if (room.error === 'ROOM_NOT_FOUND') {
      return sendError(res, 404, room.error);
    }

    if (room.error === 'INVALID_DISPLAY_NAME') {
      return sendError(res, 400, room.error, { message: 'Display name must not be empty' });
    }

    if (room.error === 'DISPLAY_NAME_TOO_LONG') {
      return sendError(res, 400, room.error, { message: 'Display name max length is 30 chars' });
    }

    return sendError(res, 409, room.error, { message: 'Display name already taken in room' });
  }

  return res.json({ room: room.room });
});

roomsRouter.post('/join-by-code', (req, res) => {
  const { userId, userName } = getUserContext(req);
  if (!userId) {
    return sendError(res, 401, 'UNAUTHORIZED', { message: 'x-user-id header is required' });
  }

  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  if (!code) {
    return sendError(res, 400, 'VALIDATION_ERROR', { message: 'code is required' });
  }

  const room = roomsService.joinRoomByCode({ code, userId, displayName: userName });

  if ('error' in room) {
    if (room.error === 'ROOM_NOT_FOUND') {
      return sendError(res, 404, room.error);
    }

    if (room.error === 'INVALID_DISPLAY_NAME') {
      return sendError(res, 400, room.error, { message: 'Display name must not be empty' });
    }

    if (room.error === 'DISPLAY_NAME_TOO_LONG') {
      return sendError(res, 400, room.error, { message: 'Display name max length is 30 chars' });
    }

    return sendError(res, 409, room.error, { message: 'Display name already taken in room' });
  }

  return res.json({ room: room.room });
});

roomsRouter.post('/:roomId/start', (req, res) => {
  const { userId } = getUserContext(req);
  if (!userId) {
    return sendError(res, 401, 'UNAUTHORIZED', { message: 'x-user-id header is required' });
  }

  const result = roomsService.startRoom({ roomId: req.params.roomId, requesterId: userId });

  if ('error' in result) {
    if (result.error === 'ROOM_NOT_FOUND') {
      return sendError(res, 404, result.error);
    }

    if (result.error === 'FORBIDDEN') {
      return sendError(res, 403, result.error, { message: 'Only host can start the game' });
    }

    if (result.error === 'INSUFFICIENT_PLAYERS') {
      return sendError(res, 409, result.error, { message: 'At least 2 players required to start' });
    }

    return sendError(res, 409, result.error, { message: 'Room is not in lobby state' });
  }

  if (result.replayed) {
    return res.status(200).json({ room: result.room, session: result.session, replayed: true });
  }

  return res.status(201).json({ room: result.room, session: result.session, replayed: false });
});
