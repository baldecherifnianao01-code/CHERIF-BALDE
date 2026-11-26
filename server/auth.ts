import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { getAdminCredential } from './storage.ts';

// Clé HMAC générée en mémoire si SESSION_SECRET n'est pas défini
const RUNTIME_SESSION_SECRET =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16
    ? process.env.SESSION_SECRET
    : crypto.randomBytes(32).toString('hex');

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 heures

export function hashPassword(password: string, existingSalt?: string): { salt: string; hash: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash: derived };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHash, 'hex');
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function verifyEnvPassword(password: string): boolean {
  const envPass = process.env.ADMIN_PASSWORD;
  if (!envPass) return false;
  const a = crypto.createHash('sha256').update(password).digest();
  const b = crypto.createHash('sha256').update(envPass).digest();
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({
      role: 'admin',
      exp: Date.now() + TOKEN_TTL_MS,
      nonce: crypto.randomBytes(8).toString('hex'),
    }),
    'utf8'
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', RUNTIME_SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payload, sig] = parts;
    if (!payload || !sig) return false;

    const expectedSig = crypto
      .createHmac('sha256', RUNTIME_SESSION_SECRET)
      .update(payload)
      .digest();
    const actualSig = Buffer.from(sig, 'base64url');
    if (expectedSig.length !== actualSig.length) return false;
    if (!crypto.timingSafeEqual(expectedSig, actualSig)) return false;

    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      role?: string;
      exp?: number;
    };
    if (parsed.role !== 'admin') return false;
    if (typeof parsed.exp !== 'number' || parsed.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token || !verifySessionToken(token)) {
    res.status(401).json({ error: 'Authentification administrateur requise.' });
    return;
  }
  next();
}

export async function isAdminInitialized(): Promise<{ initialized: boolean; envManaged: boolean }> {
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim().length > 0) {
    return { initialized: true, envManaged: true };
  }
  const cred = await getAdminCredential();
  return { initialized: Boolean(cred?.hash), envManaged: false };
}
