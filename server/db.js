import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { initialProfile, initialCv, initialProjects, initialArticles, initialSettings } from '../src/data/seedData.js';
const root = fileURLToPath(new URL('../', import.meta.url));
export const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(root, '.data'));
export const DB_FILE = path.join(DATA_DIR, 'portfolio.json');
fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
export function seedDatabase() {
  const cv = { ...initialCv, profileName: 'IT Support' };
  return structuredClone({ profile: initialProfile, cv, cvProfiles: [{ ...cv, id: 'cv-it-support' }], activeCvProfileId: 'cv-it-support', projects: initialProjects,
    articles: initialArticles, experiences: initialCv.experiences, skills: initialCv.skills,
    messages: [], settings: initialSettings, media: [], analytics: { daily: {} }, schemaVersion: 3 });
}
export function writeDB(data) {
  const temp = `${DB_FILE}.${randomUUID()}.tmp`;
  try {
    const fd = fs.openSync(temp, 'wx', 0o600);
    try { fs.writeFileSync(fd, JSON.stringify(data, null, 2)); fs.fsyncSync(fd); }
    finally { fs.closeSync(fd); }
    fs.renameSync(temp, DB_FILE);
  } finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
}
export function readDB() {
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  if (!data.profile || !data.settings || !Array.isArray(data.projects)) throw new Error('Database invalid');
  let changed = false;
  if (!Array.isArray(data.cvProfiles) || data.cvProfiles.length === 0) {
    const active = { ...(data.cv || structuredClone(initialCv)), id: 'cv-it-support', profileName: data.cv?.profileName || 'IT Support' };
    data.cvProfiles = [active];
    data.activeCvProfileId = active.id;
    changed = true;
  }
  if (!data.activeCvProfileId || !data.cvProfiles.some(item => item.id === data.activeCvProfileId)) {
    data.activeCvProfileId = data.cvProfiles[0].id;
    data.cv = data.cvProfiles[0];
    changed = true;
  }
  const activeProfile = data.cvProfiles.find(item => item.id === data.activeCvProfileId);
  if (!data.cv || data.cv.id !== activeProfile.id || !data.cv.profileName) {
    data.cv = activeProfile;
    data.experiences = activeProfile.experiences || data.experiences || [];
    data.skills = activeProfile.skills || data.skills || [];
    changed = true;
  }
  if (!data.analytics || typeof data.analytics !== 'object' || !data.analytics.daily || typeof data.analytics.daily !== 'object') {
    data.analytics = { daily: {} };
    changed = true;
  }
  if (Number(data.schemaVersion || 0) < 3) {
    data.schemaVersion = 3;
    changed = true;
  }
  if (changed) writeDB(data);
  return data;
}
// Never substitute seed data after a failed read. Preserve a migration snapshot.
if (!fs.existsSync(DB_FILE)) {
  const legacy = path.join(root, 'server/db/portfolio_db.json');
  let data = seedDatabase();
  if (!process.env.DATA_DIR && fs.existsSync(legacy)) {
    data = JSON.parse(fs.readFileSync(legacy, 'utf8'));
    fs.copyFileSync(legacy, path.join(DATA_DIR, 'before-migration.json'));
  }
  data.cv ||= structuredClone(initialCv);
  data.experiences = data.cv.experiences ?? data.experiences ?? [];
  data.skills = data.cv.skills ?? data.skills ?? [];
  data.media ||= [];
  data.messages ||= [];
  data.settings = { siteTitle: data.settings?.siteTitle || initialSettings.siteTitle,
    footerText: data.settings?.footerText || initialSettings.footerText };
  for (const key of ['articles', 'projects']) {
    const seen = new Set();
    data[key] = (data[key] || []).map(item => {
      const id = item.id && !seen.has(item.id) ? item.id : randomUUID();
      seen.add(id);
      return { ...item, id, slug: item.slug || id };
    });
  }
  data.analytics ||= { daily: {} };
  data.schemaVersion = 3;
  const normalize = value => {
    if (typeof value === 'string') return value.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?=\/uploads\/)/, '');
    if (Array.isArray(value)) return value.map(normalize);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, normalize(v)]));
    return value;
  };
  writeDB(normalize(data));
}
// Serialize complete transactions, including asynchronous storage operations.
let queue = Promise.resolve();
export function transaction(change) {
  const result = queue.then(async () => {
    const data = readDB();
    const value = await change(data);
    writeDB(data);
    return value;
  });
  queue = result.catch(() => {});
  return result;
}
