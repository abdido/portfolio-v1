import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import * as db from './db.js';
import * as auth from './auth.js';
import * as storage from './storage/storageAdapter.js';
import { acquireProcessLock } from './processLock.js';
acquireProcessLock();
storage.ensureUploadDirectories();
const mediaHandler = express.Router();
mediaHandler.use((req,res,next)=>{
  if(!/\.(png|jpe?g|gif|webp|pdf|mp4|webm)$/i.test(req.path)) return res.sendStatus(404);
  res.set('Content-Security-Policy',"sandbox; default-src 'none'");next();
},express.static(storage.UPLOADS_DIR,{dotfiles:'deny'}));
const app = createApp({ db, auth, storage, config: process.env, mediaHandler });
const dist=fileURLToPath(new URL('../dist/',import.meta.url));
if(process.env.NODE_ENV==='production' || process.env.SERVE_STATIC==='true') {
  app.use(express.static(dist,{index:false}));
  app.get('*',(req,res,next)=>{
    try {
      const data=db.readDB();
      const match=req.path.match(/^\/blog\/([^/]+)$/);
      const article=match && data.articles.find(a=>(a.slug||a.id)===match[1]||a.id===match[1]);
      const known=['/','/home','/projects','/blog','/about','/contact','/admin'].includes(req.path)||article;
      const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      let html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
      html=html.replace(/<title>.*?<\/title>/,()=>'<title>'+esc(article?article.title:data.settings.siteTitle)+'</title>');
      if(article) html=html.replace(/<meta name="description" content="[^"]*"\s*\/>/,()=>'<meta name="description" content="'+esc(article.excerpt||article.title)+'" />');
      res.status(known?200:404).type('html').send(html);
    } catch(error) { next(error); }
  });
}
const port=Number(process.env.PORT||3001);
const server=app.listen(port,process.env.HOST||'127.0.0.1',()=>console.log('Portfolio server: http://'+(process.env.HOST||'127.0.0.1')+':'+server.address().port));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
