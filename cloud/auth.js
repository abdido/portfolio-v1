import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const derive=promisify(scrypt), cookieName='portfolio_session', ttl=8*60*60*1000;
const digest=token=>createHash('sha256').update(token).digest('hex');
export function createCloudAuth(store, secure=true) {
  const options={httpOnly:true,sameSite:'strict',secure,path:'/api'};
  const tokenFrom=req=>(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(cookieName+'='))?.slice(cookieName.length+1);
  const sessionId=req=>{const token=tokenFrom(req);return /^[a-f0-9]{64}$/.test(token||'')?'sessions/'+digest(token):null;};
  async function sessionFor(req) {
    const id=sessionId(req);if(!id)return null;
    const [session,admin]=await store.readMany([id,'private/admin']);
    return session && session.expires>Date.now() && session.version===admin?.version ? session : null;
  }
  async function logout(req,res) {
    const id=sessionId(req);if(id)await store.remove(id);
    res.clearCookie(cookieName,options);
  }
  async function startSession(req,res) {
    await logout(req,res);
    const admin=await store.get('private/admin');
    if(!admin)throw new Error('Admin credential not migrated');
    const token=randomBytes(32).toString('hex');
    const session={csrfToken:randomBytes(32).toString('hex'),expires:Date.now()+ttl,version:admin.version};
    await store.put('sessions/'+digest(token),session);
    res.cookie(cookieName,token,{...options,maxAge:ttl});
    return session;
  }
  async function verifyPassword(password) {
    const admin=await store.get('private/admin');
    if(!admin?.hash||!admin.salt)throw new Error('Admin credential not migrated');
    const candidate=await derive(password,admin.salt,64);
    return timingSafeEqual(candidate,Buffer.from(admin.hash,'hex'));
  }
  async function changePassword(password) {
    const salt=randomBytes(32).toString('hex');
    const hash=(await derive(password,salt,64)).toString('hex');
    await store.atomic(['private/admin'],values=>{values[0]={salt,hash,version:randomBytes(16).toString('hex')};});
  }
  const requireAdmin=(req,res,next)=>sessionFor(req).then(session=>{
    if(!session)return res.status(401).json({error:'Sesi admin berakhir. Silakan masuk kembali.'});
    if(!['GET','HEAD'].includes(req.method)&&req.get('X-CSRF-Token')!==session.csrfToken)
      return res.status(403).json({error:'Token keamanan tidak valid. Muat ulang halaman.'});
    next();
  }).catch(next);
  return {sessionFor,startSession,verifyPassword,changePassword,logout,requireAdmin};
}

