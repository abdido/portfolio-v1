import { seedDatabase } from '../server/seed.js';
const keys = ['profile','cv','cvProfiles','activeCvProfileId','projects','articles','experiences','skills','messages','settings','media','analytics','schemaVersion'];
export const STATE_KEYS = keys;
export function createFirestore(config, google) {
  const base = 'https://firestore.googleapis.com/v1/projects/'+config.FIREBASE_PROJECT_ID+'/databases/(default)/documents';
  const root = base.slice('https://firestore.googleapis.com/v1/'.length);
  const name = id => root+'/'+id;
  async function request(suffix, body, method='POST') {
    const response=await google.request(base+suffix,{method,headers:{'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw Object.assign(new Error('Firestore request failed ('+response.status+')'),{code:data.error?.status,httpStatus:response.status});
    return data;
  }
  function write(id,value,precondition) {
    const json=JSON.stringify(value);
    // Each section is a separate unindexed JSON payload, safely below Firestore's 1 MiB limit.
    if(new TextEncoder().encode(json).length>900000) throw Object.assign(new Error('Bagian data melebihi batas penyimpanan 900 KB: '+id),{status:413});
    const fields={json:{stringValue:json}};
    if(id.startsWith('sessions/'))fields.expireAt={timestampValue:new Date(value.expires).toISOString()};
    return {update:{name:name(id),fields},...(precondition?{currentDocument:precondition}:{})};
  }
  async function readMany(ids, transaction) {
    const rows=await request(':batchGet',{documents:ids.map(name),...(transaction?{transaction}:{})});
    const map=new Map(rows.filter(row=>row.found).map(row=>[row.found.name,JSON.parse(row.found.fields.json.stringValue)]));
    return ids.map(id=>map.get(name(id))??null);
  }
  async function atomic(ids, change) {
    for(let attempt=0;attempt<4;attempt++) {
      const {transaction}=await request(':beginTransaction',{});
      try {
        const values=await readMany(ids,transaction);
        const before=values.map(value=>JSON.stringify(value));
        const result=await change(values);
        const writes=values.flatMap((value,i)=>JSON.stringify(value)===before[i]?[]:value===null?[{delete:name(ids[i])}]:[write(ids[i],value)]);
        await request(':commit',{transaction,writes});
        return result;
      } catch(error) {
        await request(':rollback',{transaction}).catch(()=>{});
        if(error.code!=='ABORTED'||attempt===3) throw error;
      }
    }
  }
  const ids=keys.map(key=>'portfolio/'+key);
  const combine=values=>{
    if(values.some(value=>value===null)) throw Object.assign(new Error('Database belum dimigrasikan'),{status:503});
    const data=Object.fromEntries(keys.map((key,i)=>[key,values[i]]));
    if(!data.profile?.name||!Array.isArray(data.cvProfiles)) throw new Error('Invalid Firestore portfolio');
    return data;
  };
  return {
    name, write, request, readMany, atomic,
    get:async id=>(await readMany([id]))[0],
    put:async (id,value)=>request(':commit',{writes:[write(id,value)]}),
    remove:async id=>request(':commit',{writes:[{delete:name(id)}]}),
    // Single batchGet provides a consistent read time for the complete state.
    readDB:async ()=>combine(await readMany(ids)),
    transaction:async change=>atomic(ids,async values=>{
      const data=combine(values);
      const result=await change(data);
      keys.forEach((key,i)=>{values[i]=data[key];});
      return result;
    }),
    seedDatabase,
    initialize:async (data,auth)=>request(':commit',{writes:[
      ...keys.map(key=>write('portfolio/'+key,data[key],{exists:false})),
      write('private/admin',auth,{exists:false})
    ]})
  };
}
