import fs from 'node:fs';
import path from 'node:path';
import { randomBytes, scryptSync, timingSafeEqual, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { DATA_DIR } from './db.js';
const derive = promisify(scrypt);
const authFile = path.join(DATA_DIR, 'auth.json');
const bootstrapFile = path.join(DATA_DIR, 'admin-bootstrap.txt');
const sessions = new Map();
const cookieName = 'portfolio_session';
const ttl = 8 * 60 * 60 * 1000;
function storePassword(password) {
  const salt = randomBytes(32).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  const temp = `${authFile}.tmp`;
  fs.writeFileSync(temp, JSON.stringify({ salt, hash }), { mode: 0o600 });
  fs.renameSync(temp, authFile);
}
if (!fs.existsSync(authFile)) {
  const password = process.env.ADMIN_PASSWORD || randomBytes(24).toString('base64url');
  if (password.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters');
  storePassword(password);
  if (!process.env.ADMIN_PASSWORD) {
    fs.writeFileSync(bootstrapFile, password + '\n', { mode: 0o600 });
    console.log(`Initial admin password saved locally: ${bootstrapFile}`);
  }
}
export async function verifyPassword(password) {
  const { salt, hash } = JSON.parse(fs.readFileSync(authFile, 'utf8'));
  const candidate = await derive(password, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
}
const options = () => ({ httpOnly: true, sameSite: 'strict', secure: process.env.COOKIE_SECURE === 'true', path: '/api' });
function tokenFrom(req) {
  return (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
}
export function sessionFor(req) {
  const token = tokenFrom(req);
  const session = sessions.get(token);
  if (session && session.expires > Date.now()) return session;
  sessions.delete(token);
  return null;
}
export function startSession(req, res) {
  sessions.delete(tokenFrom(req));
  for (const [key, session] of sessions) if (session.expires <= Date.now()) sessions.delete(key);
  const token = randomBytes(32).toString('hex');
  const session = { csrfToken: randomBytes(32).toString('hex'), expires: Date.now() + ttl };
  sessions.set(token, session);
  res.cookie(cookieName, token, { ...options(), maxAge: ttl });
  return session;
}
export function requireAdmin(req, res, next) {
  const session = sessionFor(req);
  if (!session) return res.status(401).json({ error: 'Sesi admin berakhir. Silakan masuk kembali.' });
  if (!['GET', 'HEAD'].includes(req.method) && req.get('X-CSRF-Token') !== session.csrfToken)
    return res.status(403).json({ error: 'Token keamanan tidak valid. Muat ulang halaman.' });
  next();
}
export function logout(req, res) {
  sessions.delete(tokenFrom(req));
  res.clearCookie(cookieName, options());
}
export function changePassword(password) {
  storePassword(password);
  sessions.clear();
  if (fs.existsSync(bootstrapFile)) fs.unlinkSync(bootstrapFile);
}
