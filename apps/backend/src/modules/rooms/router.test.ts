import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';

import { createApp } from '../../app';
import { roomsService } from './service';

afterEach(() => {
  roomsService.reset();
});

async function withServer(run: (baseUrl: string) => Promise<void>): Promise<void> {
  const app = createApp();
  const server = app.listen(0);

  await new Promise<void>((resolve) => {
    server.once('listening', () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('failed to bind test server');
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    await run(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}

test('POST /rooms/join-by-code joins room and remains idempotent', async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/rooms`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-user-id': 'host-1',
        'x-user-name': 'Host'
      },
      body: JSON.stringify({ title: 'Test Room' })
    });

    assert.equal(createResponse.status, 201);
    const createBody = (await createResponse.json()) as { room: { code: string; id: string } };

    const joinHeaders = {
      'content-type': 'application/json',
      'x-user-id': 'player-1',
      'x-user-name': 'Player'
    };

    const joinFirstResponse = await fetch(`${baseUrl}/rooms/join-by-code`, {
      method: 'POST',
      headers: joinHeaders,
      body: JSON.stringify({ code: createBody.room.code })
    });

    const joinSecondResponse = await fetch(`${baseUrl}/rooms/join-by-code`, {
      method: 'POST',
      headers: joinHeaders,
      body: JSON.stringify({ code: createBody.room.code })
    });

    assert.equal(joinFirstResponse.status, 200);
    assert.equal(joinSecondResponse.status, 200);

    const joinFirst = (await joinFirstResponse.json()) as { room: { members: unknown[] } };
    const joinSecond = (await joinSecondResponse.json()) as { room: { members: unknown[] } };

    assert.equal(joinFirst.room.members.length, 2);
    assert.equal(joinSecond.room.members.length, 2);

    const startForbidden = await fetch(`${baseUrl}/rooms/${createBody.room.id}/start`, {
      method: 'POST',
      headers: {
        'x-user-id': 'player-1'
      }
    });
    assert.equal(startForbidden.status, 403);

    const startHost = await fetch(`${baseUrl}/rooms/${createBody.room.id}/start`, {
      method: 'POST',
      headers: {
        'x-user-id': 'host-1'
      }
    });
    assert.equal(startHost.status, 201);

    const startHostReplay = await fetch(`${baseUrl}/rooms/${createBody.room.id}/start`, {
      method: 'POST',
      headers: {
        'x-user-id': 'host-1'
      }
    });
    assert.equal(startHostReplay.status, 200);

    const createdSession = (await startHost.json()) as { session: { id: string }; replayed: boolean };
    const replayedSession = (await startHostReplay.json()) as { session: { id: string }; replayed: boolean };
    assert.equal(createdSession.replayed, false);
    assert.equal(replayedSession.replayed, true);
    assert.equal(createdSession.session.id, replayedSession.session.id);
  });
});

test('POST /rooms/:roomId/join returns 409 when display name already taken', async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/rooms`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-user-id': 'host-1',
        'x-user-name': 'Host'
      },
      body: JSON.stringify({ title: 'Test Room' })
    });

    assert.equal(createResponse.status, 201);
    const createBody = (await createResponse.json()) as { room: { id: string } };

    const joinFirstResponse = await fetch(`${baseUrl}/rooms/${createBody.room.id}/join`, {
      method: 'POST',
      headers: {
        'x-user-id': 'player-1',
        'x-user-name': 'Player'
      }
    });
    assert.equal(joinFirstResponse.status, 200);

    const joinSecondResponse = await fetch(`${baseUrl}/rooms/${createBody.room.id}/join`, {
      method: 'POST',
      headers: {
        'x-user-id': 'player-2',
        'x-user-name': 'player'
      }
    });
    assert.equal(joinSecondResponse.status, 409);

    const body = (await joinSecondResponse.json()) as { error: string };
    assert.equal(body.error, 'DISPLAY_NAME_TAKEN');
  });
});
