import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const projectId = process.env.FIREBASE_PROJECT_ID || 'portfolio-backend-fe034';
const projectNumber = process.env.FIREBASE_PROJECT_NUMBER || '1094427546565';
const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'portfolio-backend-fe034.firebasestorage.app';
const region = process.env.FIRESTORE_LOCATION || 'asia-southeast2';
const serviceAccountId = process.env.FIREBASE_SERVICE_ACCOUNT_ID || 'portfolio-worker';
const skipStorage = process.argv.includes('--free') || process.env.SKIP_STORAGE === '1';
const tokenFile = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
const keyFile = path.resolve('.secrets/firebase-service-account.json');

const fail = (message) => { throw new Error(message); };

async function readAccessToken() {
  const raw = JSON.parse(await fs.readFile(tokenFile, 'utf8'));
  const token = raw?.tokens?.access_token;
  if (!token) fail('Firebase CLI access token not found; run firebase login first.');
  return token;
}

const token = await readAccessToken();

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = null; }
  if (!response.ok) {
    const reason = body?.error?.status || body?.error?.message || `HTTP ${response.status}`;
    throw new Error(`${response.status} ${reason}`);
  }
  return body;
}

async function enableApi(service) {
  const base = `https://serviceusage.googleapis.com/v1/projects/${projectNumber}/services/${service}`;
  try {
    await request(base);
  } catch (error) {
    if (!String(error.message).startsWith('404')) throw error;
  }
  try {
    await request(`${base}:enable`, { method: 'POST', body: '{}' });
  } catch (error) {
    if (!String(error.message).includes('already enabled')) throw error;
  }
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const state = await request(base);
    if (state?.state === 'ENABLED') return;
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }
  fail(`Timed out waiting for ${service} to become enabled.`);
}

async function ensureFirestore() {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)`;
  try {
    const existing = await request(url);
    return { created: false, location: existing.locationId || null };
  } catch (error) {
    if (!String(error.message).startsWith('404')) throw error;
  }
  await request(`https://firestore.googleapis.com/v1/projects/${projectId}/databases?databaseId=(default)`, {
    method: 'POST',
    body: JSON.stringify({
      type: 'FIRESTORE_NATIVE',
      locationId: region,
      concurrencyMode: 'OPTIMISTIC',
      deleteProtectionState: 'DELETE_PROTECTION_ENABLED',
      pointInTimeRecoveryEnablement: 'POINT_IN_TIME_RECOVERY_DISABLED',
    }),
  });
  return { created: true, location: region };
}

async function ensureBucket() {
  const url = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucketName)}`;
  try {
    await request(url);
    return { created: false };
  } catch (error) {
    if (!String(error.message).startsWith('404')) throw error;
  }
  await request(`https://storage.googleapis.com/storage/v1/b?project=${encodeURIComponent(projectId)}`, {
    method: 'POST',
    body: JSON.stringify({ name: bucketName, location: region.toUpperCase(), storageClass: 'STANDARD' }),
  });
  return { created: true };
}

async function ensureServiceAccount() {
  const list = await request(`https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts?pageSize=100`);
  const expectedEmail = `${serviceAccountId}@${projectId}.iam.gserviceaccount.com`;
  const existing = (list.accounts || []).find((account) => account.email === expectedEmail);
  if (existing) return existing;
  return request(`https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`, {
    method: 'POST',
    body: JSON.stringify({
      accountId: serviceAccountId,
      serviceAccount: { displayName: 'Portfolio Worker runtime' },
    }),
  });
}

async function grantRoles(email, roles) {
  const endpoint = `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:setIamPolicy`;
  const current = await request(`https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:getIamPolicy`, {
    method: 'POST',
    body: JSON.stringify({ options: { requestedPolicyVersion: 3 } }),
  });
  const member = `serviceAccount:${email}`;
  const bindings = [...(current.bindings || [])];
  for (const role of roles) {
    let binding = bindings.find((entry) => entry.role === role);
    if (!binding) {
      binding = { role, members: [] };
      bindings.push(binding);
    }
    if (!binding.members.includes(member)) binding.members.push(member);
  }
  await request(endpoint, {
    method: 'POST',
    body: JSON.stringify({ policy: { ...current, version: Math.max(current.version || 1, 3), bindings } }),
  });
}

async function ensureKey(email) {
  try {
    const existing = JSON.parse(await fs.readFile(keyFile, 'utf8'));
    if (existing.client_email === email && existing.project_id === projectId && existing.private_key) {
      return { created: false };
    }
    fail(`Existing ${keyFile} does not belong to the expected Firebase service account.`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const result = await request(`https://iam.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(email)}/keys`, {
    method: 'POST',
    body: JSON.stringify({ privateKeyType: 'TYPE_GOOGLE_CREDENTIALS_FILE', keyAlgorithm: 'KEY_ALG_RSA_2048' }),
  });
  if (!result.privateKeyData) fail('IAM did not return a service account key.');
  await fs.mkdir(path.dirname(keyFile), { recursive: true });
  await fs.writeFile(keyFile, Buffer.from(result.privateKeyData, 'base64').toString('utf8'), { encoding: 'utf8', flag: 'wx' });
  return { created: true };
}

for (const service of ['serviceusage.googleapis.com', 'firestore.googleapis.com', 'storage.googleapis.com', 'iam.googleapis.com', 'cloudresourcemanager.googleapis.com']) {
  await enableApi(service);
}
const firestore = await ensureFirestore();
const bucket = skipStorage ? { created: false, skipped: true } : await ensureBucket();
const account = await ensureServiceAccount();
await grantRoles(account.email, skipStorage ? ['roles/datastore.user'] : ['roles/datastore.user', 'roles/storage.objectAdmin']);
const key = await ensureKey(account.email);

console.log(JSON.stringify({
  projectId,
  firestore,
  bucket: { name: bucketName, ...bucket },
  serviceAccount: { email: account.email, keyCreated: key.created },
  credentialsPath: keyFile,
}));
