import { Buffer } from 'node:buffer';

// Only a server secret is accepted here. Firebase's public web config is not an admin credential.
export function createGoogleClient(config, fetcher = fetch) {
  let cached, pending;
  const scopes = 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/devstorage.read_write';
  const encode = value => Buffer.from(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)).toString('base64url');
  async function mint() {
    const account = JSON.parse(config.FIREBASE_SERVICE_ACCOUNT || '{}');
    if (account.project_id !== config.FIREBASE_PROJECT_ID || !account.client_email || !account.private_key)
      throw new Error('Firebase service account missing or belongs to another project');
    const now = Math.floor(Date.now()/1000);
    const unsigned = encode({alg:'RS256',typ:'JWT'})+'.'+encode({
      iss:account.client_email,scope:scopes,aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600
    });
    const pem = account.private_key.replace(/-----[^-]+-----/g,'').replace(/\s/g,'');
    const key = await crypto.subtle.importKey('pkcs8',Buffer.from(pem,'base64'),
      {name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(unsigned));
    const response = await fetcher('https://oauth2.googleapis.com/token',{
      method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:unsigned+'.'+encode(Buffer.from(signature))}),
      signal:AbortSignal.timeout(15000)
    });
    if(!response.ok) throw new Error('Firebase service account authentication failed ('+response.status+')');
    const token = await response.json();
    cached={value:token.access_token,expires:Date.now()+token.expires_in*1000-60000};
    return cached.value;
  }
  async function token() {
    if(cached?.expires>Date.now()) return cached.value;
    pending ||= mint().finally(()=>{pending=null;});
    return pending;
  }
  return {
    async request(url, init={}) {
      const headers=new Headers(init.headers);headers.set('Authorization','Bearer '+await token());
      return fetcher(url,{...init,headers,signal:init.signal||AbortSignal.timeout(30000)});
    }
  };
}
