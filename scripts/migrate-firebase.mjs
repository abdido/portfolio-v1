import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { createGoogleClient } from '../cloud/google.js';
import { createFirestore, STATE_KEYS } from '../cloud/firestore.js';
import { validateBackup } from '../server/validation.js';

const projectId='portfolio-backend-fe034';
const root=path.resolve(import.meta.dirname,'..');
const applying=process.argv.includes('--apply');
const mediaDriver=process.argv.includes('--assets')?'assets':(process.env.MEDIA_STORAGE_DRIVER||'firebase');
const accountFile=path.resolve(root,process.env.GOOGLE_APPLICATION_CREDENTIALS||'.secrets/firebase-service-account.json');
const raw=JSON.parse(await fs.readFile(path.join(root,'.data/portfolio.json'),'utf8'));
const auth=JSON.parse(await fs.readFile(path.join(root,'.data/auth.json'),'utf8'));
const data={...raw,...validateBackup({version:1,data:raw})};
const active=data.cvProfiles.find(profile=>profile.id===data.activeCvProfileId);
if(!active)throw new Error('Active CV profile is missing');
data.cv=active;data.experiences=active.experiences;data.skills=active.skills;data.schemaVersion=3;
data.media ||= [];
const files=[];
async function walk(directory) {
  for(const entry of await fs.readdir(directory,{withFileTypes:true}).catch(()=>[])) {
    const absolute=path.join(directory,entry.name);
    if(entry.isSymbolicLink())throw new Error('Media symlinks are not supported');
    if(entry.isDirectory())await walk(absolute);
    else {
      const key=path.relative(path.join(root,'uploads'),absolute).replaceAll('\\','/');
      if(!/^(images|videos|documents)\/[a-zA-Z0-9._-]+\.(png|jpe?g|gif|webp|pdf|mp4|webm)$/i.test(key))continue;
      files.push({key,absolute});
    }
  }
}
await walk(path.join(root,'uploads'));
const normalize=value=>{
  if(typeof value==='string')return value.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?=\/uploads\/)/,'');
  if(Array.isArray(value))return value.map(normalize);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,normalize(item)]));
  return value;
};
const normalized=normalize(data);
const refs=JSON.stringify(normalized).match(/\/uploads\/[^"\s]+/g)||[];
for(const ref of refs)if(!files.some(file=>'/uploads/'+file.key===ref))throw new Error('Missing local media: '+ref);
for(const item of normalized.media)if(item.url?.startsWith('/uploads/'))item.storageDriver=mediaDriver;
for(const key of STATE_KEYS)if(new TextEncoder().encode(JSON.stringify(normalized[key])).length>900000)throw new Error('Section exceeds 900 KB: '+key);
console.log(JSON.stringify({projectId,mode:applying?'apply':'check',sections:STATE_KEYS.length,cvProfiles:normalized.cvProfiles.length,mediaFiles:files.length,credentialsPresent:await fs.stat(accountFile).then(()=>true,()=>false)},null,2));
if(!applying)process.exit(0);
const config={FIREBASE_PROJECT_ID:projectId,FIREBASE_SERVICE_ACCOUNT:await fs.readFile(accountFile,'utf8')};
const google=createGoogleClient(config);
const store=createFirestore(config,google);
const existing=await store.readMany([...STATE_KEYS.map(key=>'portfolio/'+key),'private/admin']);
if(existing.some(Boolean))throw new Error('Target already contains portfolio/admin data. Migration refuses to overwrite.');
await fs.copyFile(path.join(root,'.data/portfolio.json'),path.join(root,'.data/before-firebase-'+Date.now()+'.json'));
const bucket=projectId+'.firebasestorage.app';
const types={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',pdf:'application/pdf',mp4:'video/mp4',webm:'video/webm'};
for(const file of mediaDriver==='assets'?[]:files) {
  const bytes=await fs.readFile(file.absolute);
  const base='https://storage.googleapis.com/storage/v1/b/'+bucket+'/o/'+encodeURIComponent(file.key);
  const current=await google.request(base);
  if(current.ok) {
    const metadata=await current.json();
    if(metadata.md5Hash!==createHash('md5').update(bytes).digest('base64'))throw new Error('Remote media differs: '+file.key);
  } else {
    if(current.status!==404)throw new Error('Storage unavailable ('+current.status+')');
    const uploaded=await google.request('https://storage.googleapis.com/upload/storage/v1/b/'+bucket+'/o?uploadType=media&ifGenerationMatch=0&name='+encodeURIComponent(file.key),{
      method:'POST',headers:{'Content-Type':types[file.key.split('.').at(-1).toLowerCase()]},body:bytes
    });
    if(!uploaded.ok)throw new Error('Media migration failed ('+uploaded.status+')');
  }
}
await store.initialize(normalized,{salt:auth.salt,hash:auth.hash,version:randomUUID()});
const verified=await store.readDB();
if(JSON.stringify(verified)!==JSON.stringify(Object.fromEntries(STATE_KEYS.map(key=>[key,normalized[key]]))))throw new Error('Migration verification failed');
console.log('Migration verified. Existing admin password preserved. Local data retained.');
