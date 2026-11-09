import { env } from 'cloudflare:workers';
import { httpServerHandler } from 'cloudflare:node';
import { createHash } from 'node:crypto';
import { createApp } from '../server/app.js';
import { createGoogleClient } from './google.js';
import { createFirestore } from './firestore.js';
import { createCloudAuth } from './auth.js';
import { createCloudStorage } from './storage.js';

const google=createGoogleClient(env);
const db=createFirestore(env,google);
const storage=createCloudStorage(env,google);
const auth=createCloudAuth(db,env.COOKIE_SECURE!=='false');
const makeLimit=max=>(req,res,next)=>{
  const binding=max===10?env.LOGIN_RATE_LIMIT:max===5?env.CONTACT_RATE_LIMIT:max===20?env.UPLOAD_RATE_LIMIT:env.EVENT_RATE_LIMIT;
  if(!binding)return res.status(503).json({error:'Rate limiter belum dikonfigurasi'});
  const ip=req.get('CF-Connecting-IP')||'local';
  // IP is used only by Cloudflare's short-lived limiter, never written into Firebase.
  const key=createHash('sha256').update(ip).digest('hex');
  binding.limit({key}).then(({success})=>success?next():res.status(429).json({error:'Terlalu banyak permintaan. Coba kembali nanti.'})).catch(next);
};
const app=createApp({db,auth,storage,config:{...env,CLOUD_RUNTIME:true},makeLimit});
app.listen(3000);
const api=httpServerHandler({port:3000});
export default {
  async fetch(request,bindings,ctx) {
    const url=new URL(request.url);
    try {
      if(url.pathname.startsWith('/uploads/')){
        if(env.MEDIA_STORAGE_DRIVER==='assets')return bindings.ASSETS.fetch(request);
        return await storage.serve(request);
      }
      if(url.pathname.startsWith('/api/'))return await api.fetch(request,bindings,ctx);
      return bindings.ASSETS.fetch(request);
    } catch {
      return Response.json({error:'Layanan cloud belum tersedia. Periksa konfigurasi Firebase.'},{status:503,headers:{'Cache-Control':'no-store'}});
    }
  },
  async scheduled(_event,_bindings,ctx) {
    // Firestore TTL is configured for sessions by the deployment script.
    ctx.waitUntil(db.transaction(data=>{
      const cutoff=new Date(Date.now()-180*86400000).toISOString().slice(0,10);
      for(const date of Object.keys(data.analytics?.daily||{}))if(date<cutoff)delete data.analytics.daily[date];
    }));
  }
};
