import fs from 'node:fs';
import { acquireProcessLock } from '../processLock.js';
acquireProcessLock();
import { transaction, readDB } from '../db.js';
import { localPath, uploadFile, deleteStoredFile } from './storageAdapter.js';
// Stop the server before running this command. Local files remain as rollback copies.
export async function migrate(){
  const created=[];
  try {
    const count=await transaction(async db=>{
      const replacements=new Map();
      for(let i=0;i<db.media.length;i++){
        const old=db.media[i];if(old.storageDriver==='s3')continue;
        const buffer=fs.readFileSync(localPath(old));
        const remote=await uploadFile({buffer,originalname:old.originalName,mimetype:old.mimetype},'s3');
        created.push(remote);replacements.set(old.url,remote.url);db.media[i]={...remote,id:old.id};
      }
      const replace=value=>{
        if(typeof value==='string')return replacements.get(value)||value;
        if(Array.isArray(value))return value.map(replace);
        if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,replace(v)]));
        return value;
      };
      for(const key of Object.keys(db))if(key!=='media')db[key]=replace(db[key]);
      return created.length;
    });
    console.log(`Migrated ${count} files and their references. Total media: ${readDB().media.length}`);
  }catch(error){await Promise.allSettled(created.map(deleteStoredFile));throw error;}
}
await migrate();
