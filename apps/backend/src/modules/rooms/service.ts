import crypto from 'node:crypto';

export type RoomStatus = 'lobby' | 'in_game' | 'finished';

export interface RoomMember {
  userId: string;
  displayName: string;
  joinedAt: string;
  isHost: boolean;
}

export interface GameSession {
  id: string;
  roomId: string;
  startedBy: string;
  status: 'active';
  startedAt: string;
}

export interface Room {
  id: string;
  code: string;
  title: string;
  hostId: string;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
  members: RoomMember[];
  activeSessionId?: string;
}

type JoinRoomResult = { room: Room } | { error: 'ROOM_NOT_FOUND' | 'DISPLAY_NAME_TAKEN' };

type StartRoomResult =
  | { room: Room; session: GameSession; replayed: boolean }
  | { error: 'ROOM_NOT_FOUND' | 'FORBIDDEN' | 'INVALID_STATE' | 'INSUFFICIENT_PLAYERS' };

function makeInviteCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

class RoomsService {
  private readonly rooms = new Map<string, Room>();
  private readonly sessions = new Map<string, GameSession>();

  listRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  listSessions(): GameSession[] {
    return Array.from(this.sessions.values());
  }

  getSession(sessionId: string): GameSession | null {
    return this.sessions.get(sessionId) ?? null;
  }

  getRoom(roomId: string): Room | null {
    return this.rooms.get(roomId) ?? null;
  }

  getRoomByCode(code: string): Room | null {
    const normalizedCode = code.trim().toUpperCase();
    for (const room of this.rooms.values()) {
      if (room.code === normalizedCode) {
        return room;
      }
    }

    return null;
  }

  createRoom(input: { title: string; hostId: string; hostName: string }): Room {
    const now = new Date().toISOString();
    const room: Room = {
      id: crypto.randomUUID(),
      code: makeInviteCode(),
      title: input.title,
      hostId: input.hostId,
      status: 'lobby',
      createdAt: now,
      updatedAt: now,
      members: [
        {
          userId: input.hostId,
          displayName: input.hostName,
          joinedAt: now,
          isHost: true
        }
      ]
    };

    this.rooms.set(room.id, room);
    return room;
  }

  joinRoom(input: { roomId: string; userId: string; displayName: string }): JoinRoomResult {
    const room = this.rooms.get(input.roomId);
    if (!room) {
      return { error: 'ROOM_NOT_FOUND' };
    }

    const existingMember = room.members.find((member) => member.userId === input.userId);
    if (existingMember) {
      return { room };
    }

    const normalizedDisplayName = input.displayName.trim().toLowerCase();
    const isNameTaken = room.members.some((member) => member.displayName.trim().toLowerCase() === normalizedDisplayName);

    if (isNameTaken) {
      return { error: 'DISPLAY_NAME_TAKEN' };
    }

    room.members.push({
      userId: input.userId,
      displayName: input.displayName,
      joinedAt: new Date().toISOString(),
      isHost: false
    });
    room.updatedAt = new Date().toISOString();

    return { room };
  }


  joinRoomByCode(input: { code: string; userId: string; displayName: string }): JoinRoomResult {
    const room = this.getRoomByCode(input.code);
    if (!room) {
      return { error: 'ROOM_NOT_FOUND' };
    }

    return this.joinRoom({ roomId: room.id, userId: input.userId, displayName: input.displayName });
  }

  reset(): void {
    this.rooms.clear();
    this.sessions.clear();
  }

  startRoom(input: { roomId: string; requesterId: string }): StartRoomResult {
    const room = this.rooms.get(input.roomId);
    if (!room) {
      return { error: 'ROOM_NOT_FOUND' };
    }

    if (room.hostId !== input.requesterId) {
      return { error: 'FORBIDDEN' };
    }

    if (room.status === 'in_game' && room.activeSessionId) {
      const currentSession = this.sessions.get(room.activeSessionId);
      if (currentSession) {
        return { room, session: currentSession, replayed: true };
      }
    }

    if (room.status !== 'lobby') {
      return { error: 'INVALID_STATE' };
    }

    if (room.members.length < 2) {
      return { error: 'INSUFFICIENT_PLAYERS' };
    }

    const session: GameSession = {
      id: crypto.randomUUID(),
      roomId: room.id,
      startedBy: input.requesterId,
      status: 'active',
      startedAt: new Date().toISOString()
    };

    room.status = 'in_game';
    room.updatedAt = new Date().toISOString();
    room.activeSessionId = session.id;
    this.sessions.set(session.id, session);

    return { room, session, replayed: false };
  }
}

export const roomsService = new RoomsService();
