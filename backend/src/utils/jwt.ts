import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { JwtPayload } from '../types/index';
import config from '../config/index';
import { JWT_EXPIRES_IN } from './constants';

/**
 * Sign a JWT token containing userId and role.
 */
export function signToken(userId: number, role: Role): string {
  const payload: JwtPayload = { userId, role };
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token.
 * Returns the payload or null if invalid/expired.
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}
