import { randomUUID } from 'node:crypto';
import { fileTypeFromBuffer } from 'file-type';
const allowed=new Set(['image/jpeg','image/png','image/webp','image/gif','application/pdf','video/mp4','video/webm']);
const validKey=key=>/^(images|videos|documents)\/[a-zA-Z0-9._-]+\.(png|jpe?g|gif|webp|pdf|mp4|webm)$/i.test(key);
export function createCloudStorage(config,google) {
  const bucket=encodeURIComponent(config.FIREBASE_STORAGE_BUCKET);
  const base='https://storage.googleapis.com/storage/v1/b/'+bucket+'/o/';
  async function validateFile(file) {
    const type=await fileTypeFromBuffer(file.buffer);
    if(!type||!allowed.has(type.mime)||type.mime!==file.mimetype)throw Object.assign(new Error('Jenis file tidak didukung atau isi tidak sesuai'),{status:400});
    return type;
  }
  async function uploadFile(file) {
    const type=await validateFile(file);
    const category=type.mime.startsWith('image/')?'images':type.mime.startsWith('video/')?'videos':'documents';
    const filename=randomUUID()+'.'+type.ext;
    const key=category+'/'+filename;
    const response=await google.request('https://storage.googleapis.com/upload/storage/v1/b/'+bucket+'/o?uploadType=media&ifGenerationMatch=0&name='+encodeURIComponent(key),{
      method:'POST',headers:{'Content-Type':type.mime},body:file.buffer
    });
    if(!response.ok)throw new Error('Firebase Storage upload failed ('+response.status+')');
    const now=new Date();
    return {id:randomUUID(),filename,originalName:file.originalname.split(/[\\/]/).at(-1).slice(0,255),category,
      mimetype:type.mime,size:file.buffer.length,formattedSize:(file.buffer.length/1024).toFixed(1)+' KB',
      uploadedAt:now.toISOString(),formattedDate:now.toLocaleDateString('id-ID'),storageDriver:'firebase',
      url:'/uploads/'+key};
  }
  async function deleteStoredFile(item) {
    const key=item.category+'/'+item.filename;
    if(item.storageDriver!=='firebase'||!validKey(key))throw new Error('Invalid Firebase media key');
    const response=await google.request(base+encodeURIComponent(key),{method:'DELETE'});
    if(!response.ok&&response.status!==404)throw new Error('Firebase Storage delete failed ('+response.status+')');
  }
  async function serve(request) {
    const key=new URL(request.url).pathname.slice('/uploads/'.length);
    if(!['GET','HEAD'].includes(request.method)||!validKey(key))return new Response('Not found',{status:404});
    const headers={};
    const range=request.headers.get('Range');if(range)headers.Range=range;
    const upstream=await google.request(base+encodeURIComponent(key)+'?alt=media',{method:request.method,headers});
    if(!upstream.ok)return new Response('Media unavailable',{status:upstream.status===404?404:502});
    const result=new Headers({'X-Content-Type-Options':'nosniff','Content-Security-Policy':"sandbox; default-src 'none'",'Cache-Control':'public, max-age=3600'});
    for(const key of ['Content-Type','Content-Length','Content-Range','Accept-Ranges','ETag'])if(upstream.headers.has(key))result.set(key,upstream.headers.get(key));
    return new Response(upstream.body,{status:upstream.status,headers:result});
  }
  return {validateFile,uploadFile,deleteStoredFile,serve};
}

