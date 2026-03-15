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

  assert.ok(!('error' in firstJoin));
  assert.ok(!('error' in secondJoin));

  if ('error' in firstJoin || 'error' in secondJoin) {
    throw new Error('expected successful join');
  }

  assert.equal(firstJoin.room.members.length, 2);
  assert.equal(secondJoin.room.members.length, 2);
});

test('joinRoom rejects duplicated display name for another user', () => {
  roomsService.reset();

  const room = roomsService.createRoom({
    title: 'Room',
    hostId: 'host-1',
    hostName: 'Host'
  });

  const firstJoin = roomsService.joinRoom({
    roomId: room.id,
    userId: 'player-1',
    displayName: 'Player'
  });
  assert.ok(!('error' in firstJoin));

  const duplicatedName = roomsService.joinRoom({
    roomId: room.id,
    userId: 'player-2',
    displayName: 'player'
  });

  assert.deepEqual(duplicatedName, { error: 'DISPLAY_NAME_TAKEN' });
});



test('joinRoom rejects empty and too long display names', () => {
  roomsService.reset();

  const room = roomsService.createRoom({
    title: 'Room',
    hostId: 'host-1',
    hostName: 'Host'
  });

  const emptyDisplayName = roomsService.joinRoom({
    roomId: room.id,
    userId: 'player-empty',
    displayName: '   '
  });
  assert.deepEqual(emptyDisplayName, { error: 'INVALID_DISPLAY_NAME' });

  const tooLongDisplayName = roomsService.joinRoom({
    roomId: room.id,
    userId: 'player-long',
    displayName: 'A'.repeat(31)
  });
  assert.deepEqual(tooLongDisplayName, { error: 'DISPLAY_NAME_TOO_LONG' });
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
    assert.equal(started.replayed, false);
  }

  const replayed = roomsService.startRoom({ roomId: room.id, requesterId: 'host-1' });
  assert.ok('session' in replayed);
  if ('session' in replayed && 'session' in started) {
    assert.equal(replayed.replayed, true);
    assert.equal(replayed.session.id, started.session.id);
  }
});
