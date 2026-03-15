import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';

import { createApp } from '../../app';
import { roomsService } from '../rooms/service';

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

test('GET /sessions returns started sessions and GET /sessions/:id returns exact session', async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/rooms`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-user-id': 'host-1',
        'x-user-name': 'Host'
      },
      body: JSON.stringify({ title: 'Quiz Room' })
    });

    assert.equal(createResponse.status, 201);
    const createBody = (await createResponse.json()) as { room: { id: string } };

    const joinResponse = await fetch(`${baseUrl}/rooms/${createBody.room.id}/join`, {
      method: 'POST',
      headers: {
        'x-user-id': 'player-1',
        'x-user-name': 'Player'
      }
    });
    assert.equal(joinResponse.status, 200);

    const startResponse = await fetch(`${baseUrl}/rooms/${createBody.room.id}/start`, {
      method: 'POST',
      headers: {
        'x-user-id': 'host-1'
      }
    });
    assert.equal(startResponse.status, 201);

    const started = (await startResponse.json()) as { session: { id: string; roomId: string } };

    const listSessionsResponse = await fetch(`${baseUrl}/sessions`);
    assert.equal(listSessionsResponse.status, 200);
    const listPayload = (await listSessionsResponse.json()) as {
      items: Array<{ id: string; roomId: string; status: string }>;
    };

    assert.equal(listPayload.items.length, 1);
    assert.equal(listPayload.items[0]?.id, started.session.id);
    assert.equal(listPayload.items[0]?.roomId, createBody.room.id);

    const sessionDetailsResponse = await fetch(`${baseUrl}/sessions/${started.session.id}`);
    assert.equal(sessionDetailsResponse.status, 200);

    const sessionPayload = (await sessionDetailsResponse.json()) as { session: { id: string; roomId: string } };
    assert.equal(sessionPayload.session.id, started.session.id);
    assert.equal(sessionPayload.session.roomId, createBody.room.id);
  });
});

test('GET /sessions/:id returns SESSION_NOT_FOUND for unknown session', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/sessions/missing-session`);
    assert.equal(response.status, 404);

    const payload = (await response.json()) as { error: string };
    assert.equal(payload.error, 'SESSION_NOT_FOUND');
  });
});
