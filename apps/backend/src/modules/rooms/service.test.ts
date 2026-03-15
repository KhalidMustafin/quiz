import assert from 'node:assert/strict';
import test from 'node:test';

import { roomsService } from './service';

test('joinRoom is idempotent for the same user', () => {
  roomsService.reset();

  const room = roomsService.createRoom({
    title: 'Room',
    hostId: 'host-1',
    hostName: 'Host'
  });

  const firstJoin = roomsService.joinRoom({
    roomId: room.id,
    userId: 'player-1',
    displayName: 'Player 1'
  });
  const secondJoin = roomsService.joinRoom({
    roomId: room.id,
    userId: 'player-1',
    displayName: 'Player 1'
  });

  assert.ok(firstJoin);
  assert.ok(secondJoin);
  assert.equal(firstJoin.members.length, 2);
  assert.equal(secondJoin.members.length, 2);
});

test('only host can start room and at least two players are required', () => {
  roomsService.reset();

  const room = roomsService.createRoom({
    title: 'Room',
    hostId: 'host-1',
    hostName: 'Host'
  });

  const insufficientPlayers = roomsService.startRoom({ roomId: room.id, requesterId: 'host-1' });
  assert.deepEqual(insufficientPlayers, { error: 'INSUFFICIENT_PLAYERS' });

  roomsService.joinRoom({ roomId: room.id, userId: 'player-1', displayName: 'P1' });

  const forbidden = roomsService.startRoom({ roomId: room.id, requesterId: 'player-1' });
  assert.deepEqual(forbidden, { error: 'FORBIDDEN' });

  const started = roomsService.startRoom({ roomId: room.id, requesterId: 'host-1' });
  assert.ok('session' in started);
  if ('session' in started) {
    assert.equal(started.room.status, 'in_game');
    assert.equal(started.session.roomId, room.id);
  }
});
