export type UserRole = 'player' | 'moderator' | 'admin';

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  service: string;
}
