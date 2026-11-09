import express from 'express';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { rateLimit } from 'express-rate-limit';
import { validateRecord, validateBackup, validateAnalyticsEvent, parse, passwordSchema } from './validation.js';

// Storage and authentication are injected so Node and Workers share every API route.
export function createApp({ db, auth, storage, config = {}, makeLimit, mediaHandler }) {
const { readDB, transaction, seedDatabase } = db;
const { sessionFor, startSession, requireAdmin, verifyPassword, logout, changePassword } = auth;
const { uploadFile, validateFile, deleteStoredFile } = storage;
const app = express();
app.disable('x-powered-by');
if (config.TRUST_PROXY) app.set('trust proxy', config.TRUST_PROXY.split(','));

const wrap = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
const fail = (status, message) => { throw Object.assign(new Error(message),{status}); };
app.use((req,res,next) => {
  res.set({ 'X-Content-Type-Options':'nosniff', 'X-Frame-Options':'SAMEORIGIN', 'Referrer-Policy':'strict-origin-when-cross-origin' });
  if (req.path.startsWith('/api')) res.set('Cache-Control','no-store');
  if (!['GET','HEAD','OPTIONS'].includes(req.method)) {
    const origin = req.get('origin');
    const ownOrigin = `${config.CLOUD_RUNTIME && config.COOKIE_SECURE !== 'false' ? 'https' : 'http'}://${req.get('host')}`;
    const allowed = config.PUBLIC_ORIGIN?.split(',') || (config.CLOUD_RUNTIME ? [ownOrigin] : ['http://localhost:5173','http://localhost:5174','http://localhost:8080','http://127.0.0.1:8080',ownOrigin]);
    if (origin && !allowed.includes(origin)) return res.status(403).json({error:'Origin tidak diizinkan'});
    if (req.get('sec-fetch-site') === 'cross-site') return res.status(403).json({error:'Permintaan lintas situs ditolak'});
  }
  next();
});
app.use(express.json({limit:'5mb'}));
const limit = makeLimit || ((max, windowMs=15*60*1000) => rateLimit({windowMs,limit:max,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Terlalu banyak permintaan. Coba kembali nanti.'}}));
const ANALYTICS_RETENTION_DAYS = 180;
const analyticsDay = () => ({ views: 0, pageViews: {}, cvDownloads: 0, cvProfiles: {}, contacts: 0 });
const analyticsDate = value => new Date(value).toISOString().slice(0, 10);
const pruneAnalytics = analytics => {
  const cutoff = Date.now() - ANALYTICS_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  for (const key of Object.keys(analytics.daily || {})) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || Date.parse(`${key}T00:00:00.000Z`) < cutoff) delete analytics.daily[key];
  }
};
const recordAnalytics = (db, event) => {
  db.analytics ||= { daily: {} };
  db.analytics.daily ||= {};
  const date = analyticsDate(new Date());
  const day = db.analytics.daily[date] ||= analyticsDay();
  day.views = Number.isInteger(day.views) && day.views >= 0 ? day.views : 0;
  day.pageViews ||= {};
  day.cvDownloads = Number.isInteger(day.cvDownloads) && day.cvDownloads >= 0 ? day.cvDownloads : 0;
  day.cvProfiles ||= {};
  day.contacts = Number.isInteger(day.contacts) && day.contacts >= 0 ? day.contacts : 0;
  if (event.type === 'page_view') {
    const page = event.page?.startsWith('/') ? event.page : '/';
    day.views += 1;
    day.pageViews[page] = (day.pageViews[page] || 0) + 1;
  }
  if (event.type === 'cv_download') {
    day.cvDownloads += 1;
    if (event.profileId && db.cvProfiles?.some(profile => profile.id === event.profileId)) {
      day.cvProfiles[event.profileId] = (day.cvProfiles[event.profileId] || 0) + 1;
    }
  }
  if (event.type === 'contact') day.contacts += 1;
  pruneAnalytics(db.analytics);
};
const analyticsSummary = (db, requestedDays = 30) => {
  const days = Math.min(90, Math.max(7, Number.isFinite(requestedDays) ? requestedDays : 30));
  const daily = [];
  const pageViews = {};
  const cvProfiles = {};
  let pageViewsTotal = 0;
  let cvDownloads = 0;
  let contacts = 0;
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - offset);
    const key = analyticsDate(date);
    const source = db.analytics?.daily?.[key] || analyticsDay();
    const item = { date: key, views: source.views || 0, cvDownloads: source.cvDownloads || 0, contacts: source.contacts || 0 };
    daily.push(item);
    pageViewsTotal += item.views;
    cvDownloads += item.cvDownloads;
    contacts += item.contacts;
    for (const [page, count] of Object.entries(source.pageViews || {})) pageViews[page] = (pageViews[page] || 0) + count;
    for (const [profileId, count] of Object.entries(source.cvProfiles || {})) cvProfiles[profileId] = (cvProfiles[profileId] || 0) + count;
  }
  const topPages = Object.entries(pageViews).map(([page, views]) => ({ page, views })).sort((a, b) => b.views - a.views).slice(0, 8);
  const topCvProfiles = Object.entries(cvProfiles).map(([id, downloads]) => ({
    id, downloads, name: db.cvProfiles?.find(profile => profile.id === id)?.profileName || 'CV'
  })).sort((a, b) => b.downloads - a.downloads).slice(0, 8);
  return { range: { days, from: daily[0].date, to: daily.at(-1).date }, totals: { pageViews: pageViewsTotal, cvDownloads, contacts }, daily, topPages, topCvProfiles };
};
const publicData = db => ({ profile: db.profile, cv: {...db.cv,experiences:db.cv?.experiences || db.experiences,skills:db.cv?.skills || db.skills},
  projects: db.projects, articles: (db.articles || []).filter(a => !a.hidden), experiences: db.experiences.filter(e=>e.isActive!==false), skills: db.skills,
  settings: {siteTitle: db.settings.siteTitle,footerText:db.settings.footerText} });
const adminData = db => ({...publicData(db), articles: db.articles || [], experiences:db.experiences, messages:db.messages,
  cvProfiles: db.cvProfiles, activeCvProfileId: db.activeCvProfileId});
app.get('/api/health', wrap(async (_req,res) => { await readDB(); res.json({status:'ok'}); }));
app.get('/api/data', wrap(async (_req,res) => res.json(publicData(await readDB()))));
app.get('/api/auth/session', wrap(async (req,res) => {
  const session = await sessionFor(req);
  res.json({authenticated:!!session,csrfToken:session?.csrfToken});
}));
app.post('/api/auth/login', limit(10), wrap(async (req,res) => {
  if (typeof req.body?.password !== 'string' || req.body.password.length > 256) fail(400,'Password tidak valid');
  if (!await verifyPassword(req.body.password)) fail(401,'Password salah');
  const session = await startSession(req,res);
  res.json({authenticated:true,csrfToken:session.csrfToken,data:adminData(await readDB())});
}));
app.post('/api/auth/logout', requireAdmin, wrap(async (req,res) => { await logout(req,res); res.json({success:true}); }));
app.put('/api/auth/password', requireAdmin, limit(10), wrap(async (req,res) => {
  const body = parse(passwordSchema, req.body);
  if (!await verifyPassword(body.currentPassword)) fail(401,'Password saat ini salah');
  await changePassword(body.newPassword);
  const session = await startSession(req,res);
  res.json({success:true,csrfToken:session.csrfToken});
}));
app.get('/api/admin/data',requireAdmin,wrap(async (_req,res)=>res.json(adminData(await readDB()))));
app.post('/api/messages',limit(5),wrap(async(req,res)=>{
  const body = validateRecord('messages',req.body);
  await transaction(db=>{db.messages.unshift({...body,id:randomUUID(),date:new Date().toISOString(),read:false});recordAnalytics(db,{type:'contact'});});
  res.status(201).json({success:true});
}));
app.post('/api/analytics/events', limit(120, 60 * 1000), wrap(async (req, res) => {
  const event = validateAnalyticsEvent(req.body);
  await transaction(db => recordAnalytics(db, event));
  res.status(204).end();
}));
for (const name of ['projects','articles','cv']) app.get(`/api/${name}`,wrap(async (_req,res)=>res.json(publicData(await readDB())[name])));
// Everything below this boundary in /api requires a verified admin session.
if (mediaHandler) app.use('/uploads', mediaHandler);
app.use('/api', requireAdmin);
app.get('/api/analytics', wrap(async (req, res) => {
  const requestedDays = Number.parseInt(req.query.days, 10);
  res.json(analyticsSummary(await readDB(), requestedDays));
}));
const slug = title => title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100)||'post';
const uniqueSlug = (title, items) => {
  const base = slug(title); let candidate=base; let suffix=2;
  while(items.some(i=>(i.slug||i.id)===candidate)) candidate=`${base}-${suffix++}`;
  return candidate;
};
const syncCareer = db => {
  db.cv.experiences = db.experiences;
  db.cv.skills = db.skills;
  const active = db.cvProfiles?.find(item => item.id === db.activeCvProfileId);
  if (active) { active.experiences = db.experiences; active.skills = db.skills; }
};
for(const name of ['profile','settings','cv']) app.put(`/api/${name}`,wrap(async(req,res)=>{
  const body=validateRecord(name,req.body);
  if(name==='cv') for(const records of [body.skills,body.experiences]) if(new Set(records.map(r=>r.id)).size!==records.length) fail(400,'ID duplikat');
  const result = await transaction(db=>{
    db[name]=body;
    if(name==='cv') {
      db.experiences=body.experiences;db.skills=body.skills;
      const active = db.cvProfiles.find(item => item.id === db.activeCvProfileId);
      if (active) { db.cv = {...body, id: active.id}; db.cvProfiles[db.cvProfiles.indexOf(active)] = db.cv; }
    }
    return { body: name==='cv' ? db.cv : body, cvProfiles: db.cvProfiles, activeCvProfileId: db.activeCvProfileId };
  });
  res.json({success:true,[name]:result.body, ...(name==='cv'?{cvProfiles:result.cvProfiles,activeCvProfileId:result.activeCvProfileId}:{})});
}));

// CV profiles are private CMS records. The selected profile is the one shown publicly.
app.get('/api/cv-profiles', requireAdmin, wrap(async (_req,res) => { const db=await readDB(); res.json({ profiles:db.cvProfiles,activeCvProfileId:db.activeCvProfileId }); }));
app.post('/api/cv-profiles', wrap(async (req,res) => {
  const body = validateRecord('cv', req.body);
  const result = await transaction(db => {
    const item = {...body, id: randomUUID(), profileName: body.profileName || body.roleId || 'CV Baru'};
    db.cvProfiles.push(item);
    return item;
  });
  res.status(201).json(result);
}));
app.put('/api/cv-profiles/:id', wrap(async (req,res) => {
  const result = await transaction(db => {
    const index = db.cvProfiles.findIndex(item => item.id === req.params.id);
    if (index < 0) fail(404,'Profil CV tidak ditemukan');
    const existing = db.cvProfiles[index];
    const body = validateRecord('cv', {...existing, ...req.body});
    const item = {...body, id: existing.id, profileName: body.profileName || existing.profileName || 'CV'};
    db.cvProfiles[index] = item;
    if (db.activeCvProfileId === item.id) { db.cv = item; db.experiences = item.experiences; db.skills = item.skills; }
    return item;
  });
  res.json(result);
}));
app.post('/api/cv-profiles/:id/activate', wrap(async (req,res) => {
  const result = await transaction(db => {
    const item = db.cvProfiles.find(profile => profile.id === req.params.id);
    if (!item) fail(404,'Profil CV tidak ditemukan');
    db.activeCvProfileId = item.id; db.cv = item; db.experiences = item.experiences || []; db.skills = item.skills || [];
    return {cv:item, activeCvProfileId:item.id, cvProfiles:db.cvProfiles};
  });
  res.json(result);
}));
app.delete('/api/cv-profiles/:id', wrap(async (req,res) => {
  const result = await transaction(db => {
    if (db.cvProfiles.length <= 1) fail(409,'Minimal satu profil CV harus tersimpan');
    const index = db.cvProfiles.findIndex(item => item.id === req.params.id);
    if (index < 0) fail(404,'Profil CV tidak ditemukan');
    const wasActive = db.activeCvProfileId === req.params.id;
    db.cvProfiles.splice(index,1);
    if (wasActive) { const next = db.cvProfiles[0]; db.activeCvProfileId=next.id; db.cv=next; db.experiences=next.experiences||[]; db.skills=next.skills||[]; }
    return {activeCvProfileId:db.activeCvProfileId,cv:db.cv,cvProfiles:db.cvProfiles};
  });
  res.json(result);
}));
for(const name of ['projects','articles','experiences','skills']) {
  app.post(`/api/${name}`,wrap(async(req,res)=>{
    const body=validateRecord(name,req.body);
    const item=await transaction(db=>{
      const item={...body,id:randomUUID(),createdAt:new Date().toISOString()};
      if(['projects','articles'].includes(name)) item.slug=uniqueSlug(body.title,db[name]);
      if(name==='articles') item.date ||= new Date().toISOString();
      db[name].unshift(item);syncCareer(db);return item;
    });
    res.status(201).json(item);
  }));
  app.put(`/api/${name}/:id`,wrap(async(req,res)=>{
    const item=await transaction(db=>{
      const index=db[name].findIndex(i=>i.id===req.params.id);if(index<0) fail(404,'Data tidak ditemukan');
      const old=db[name][index];
      const next=validateRecord(name,{...old,...req.body});
      db[name][index]={...old,...next,id:old.id};syncCareer(db);return db[name][index];
    });
    res.json(item);
  }));
}
for(const name of ['projects','articles','experiences','skills','messages']) app.delete(`/api/${name}/:id`,wrap(async(req,res)=>{
  await transaction(db=>{
    const index=db[name].findIndex(i=>i.id===req.params.id);if(index<0) fail(404,'Data tidak ditemukan');
    db[name].splice(index,1);syncCareer(db);
  });res.json({success:true});
}));
app.put('/api/messages/:id/read',wrap(async(req,res)=>{
  const item=await transaction(db=>{const item=db.messages.find(i=>i.id===req.params.id);if(!item) fail(404,'Pesan tidak ditemukan');item.read=true;return item;});
  res.json(item);
}));
app.get('/api/backup',wrap(async (_req,res)=>{
  const db=await readDB();
  res.attachment('portfolio-backup.json').json({version:1,exportedAt:new Date().toISOString(),
    note:'Content backup. Media files and authentication are separate. Analytics are aggregate and retained for 180 days.',data:{...adminData(db),analytics:db.analytics}});
}));
app.post('/api/backup/restore',wrap(async(req,res)=>{
  const restored=validateBackup(req.body);
  await transaction(db=>{Object.assign(db,restored);db.experiences=restored.cv.experiences;db.skills=restored.cv.skills;});
  res.json({success:true,data:adminData(await readDB())});
}));
app.post('/api/reset',wrap(async(_req,res)=>{
  await transaction(db=>{const media=db.media;Object.assign(db,seedDatabase(),{media});});
  res.json({success:true,data:adminData(await readDB())});
}));
app.get('/api/media',wrap(async (_req,res)=>res.json((await readDB()).media)));
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:20*1024*1024,files:5,fields:0,parts:5}});
app.post('/api/media/upload',limit(20),upload.array('files',5),wrap(async(req,res)=>{
  if(config.MEDIA_STORAGE_DRIVER==='assets') fail(503,'Upload media dinonaktifkan pada paket gratis. Tambahkan file ke public/uploads lalu deploy ulang.');
  if(!req.files?.length) fail(400,'Pilih file untuk diunggah');
  for(const file of req.files) await validateFile(file);
  const created=[];
  try {
    for(const file of req.files) created.push(await uploadFile(file));
    await transaction(db=>{
      if(db.media.reduce((n,m)=>n+m.size,0)+req.files.reduce((n,f)=>n+f.size,0)>Number(config.MEDIA_QUOTA_BYTES||1073741824)) fail(413,'Kuota media penuh');
      db.media.unshift(...created);
    });
  } catch(error) { await Promise.allSettled(created.map(deleteStoredFile)); throw error; }
  res.status(201).json({success:true,count:created.length,media:created});
}));
app.delete('/api/media/:id',wrap(async(req,res)=>{
  if(config.MEDIA_STORAGE_DRIVER==='assets') fail(503,'Media statis dikelola melalui file project pada paket gratis.');
  const item=await transaction(db=>{
    const index=db.media.findIndex(i=>i.id===req.params.id);if(index<0) fail(404,'Media tidak ditemukan');
    const item=db.media[index];
    const content=JSON.stringify({...db,media:undefined});
    if(content.includes(item.url)) fail(409,'Media masih digunakan oleh konten. Hapus referensinya terlebih dahulu.');
    db.media.splice(index,1);return item;
  });
  try {await deleteStoredFile(item);} catch(error) {await transaction(db=>db.media.push(item));throw error;}
  res.json({success:true});
}));
app.use('/api',(_req,res)=>res.status(404).json({error:'Endpoint tidak ditemukan'}));
app.use((error,_req,res,_next)=>{
  const status=error.status || (error instanceof multer.MulterError ? 400 : 500);
  if(status>=500) console.error('Request failed:',error.message);
  res.status(status).json({error:status>=500?'Penyimpanan gagal. Data belum disimpan; silakan coba kembali.':error.message});
});

return app;
}
