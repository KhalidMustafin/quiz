import type { Response } from 'express';
import crypto from 'node:crypto';

export interface ErrorEnvelope {
  error: string;
  message?: string;
  details?: Record<string, unknown>;
  traceId: string;
}

export function sendError(
  res: Response,
  status: number,
  error: string,
  options?: { message?: string; details?: Record<string, unknown> }
) {
  const body: ErrorEnvelope = {
    error,
    traceId: crypto.randomUUID()
  };

  if (options?.message) {
    body.message = options.message;
  }

  if (options?.details) {
    body.details = options.details;
  }

  return res.status(status).json(body);
}
