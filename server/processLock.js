import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './db.js';
export function acquireProcessLock(){
  const lock=path.join(DATA_DIR,'writer.lock');
  if(fs.existsSync(lock)){
    const {pid}=JSON.parse(fs.readFileSync(lock,'utf8'));
    let active=true;try{process.kill(pid,0);}catch(error){if(error.code==='ESRCH')active=false;else throw error;}
    if(active)throw new Error('Database already owned by another server/migration process. Stop it first.');
    fs.unlinkSync(lock);
  }
  const fd=fs.openSync(lock,'wx',0o600);
  fs.writeFileSync(fd,JSON.stringify({pid:process.pid}));fs.closeSync(fd);
  process.once('exit',()=>{if(fs.existsSync(lock)&&JSON.parse(fs.readFileSync(lock,'utf8')).pid===process.pid)fs.unlinkSync(lock);});
}
