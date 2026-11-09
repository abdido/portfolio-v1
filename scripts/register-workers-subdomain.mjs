import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const accountId = 'd393dd8a9320b5c7c7a89fdc3224881f';
const requested = process.env.WORKERS_SUBDOMAIN || 'abdillah-portfolio';
const configFile = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const config = await fs.readFile(configFile, 'utf8');
const token = config.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
if (!token) throw new Error('Wrangler OAuth token not found; run wrangler login first.');
if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(requested)) throw new Error('Invalid workers.dev subdomain.');

async function api(pathname, options = {}) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${pathname}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    const message = body?.errors?.[0]?.message || `HTTP ${response.status}`;
    throw new Error(`${response.status} ${message}`);
  }
  return body?.result;
}

let current = null;
try { current = await api(`/accounts/${accountId}/workers/subdomain`); } catch (error) {
  if (!String(error.message).startsWith('404')) throw error;
}
if (current?.subdomain) {
  console.log(JSON.stringify({ created: false, subdomain: current.subdomain }));
  process.exit(0);
}
const result = await api(`/accounts/${accountId}/workers/subdomain`, {
  method: 'PUT',
  body: JSON.stringify({ subdomain: requested }),
});
console.log(JSON.stringify({ created: true, subdomain: result.subdomain }));
