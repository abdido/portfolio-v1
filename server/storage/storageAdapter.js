import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { fileTypeFromBuffer } from 'file-type';
export const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || fileURLToPath(new URL('../../uploads', import.meta.url)));
export const SUB_DIRS = Object.fromEntries(['images','videos','documents'].map(k => [k,path.join(UPLOADS_DIR,k)]));
export const STORAGE_CONFIG = { driver: process.env.STORAGE_DRIVER || 'local', s3: {
  endpoint: process.env.AWS_S3_ENDPOINT || undefined, region: process.env.AWS_REGION || 'auto',
  bucket: process.env.AWS_S3_BUCKET_NAME, publicDomain: process.env.AWS_S3_PUBLIC_DOMAIN,
} };
if (!['local','s3'].includes(STORAGE_CONFIG.driver)) throw new Error('Invalid STORAGE_DRIVER');
const allowed = new Set(['image/jpeg','image/png','image/webp','image/gif','application/pdf','video/mp4','video/webm']);
export function ensureUploadDirectories() { for (const dir of Object.values(SUB_DIRS)) fs.mkdirSync(dir,{recursive:true}); }
export const getFileCategory = mime => mime.startsWith('image/') ? 'images' : mime.startsWith('video/') ? 'videos' : 'documents';
export const formatBytes = bytes => bytes < 1024 ? `${bytes} Bytes` : bytes < 1048576 ? `${(bytes/1024).toFixed(1)} KB` : `${(bytes/1048576).toFixed(1)} MB`;
export function localPath(item) {
  if (!SUB_DIRS[item.category] || path.basename(item.filename) !== item.filename || !/^[a-zA-Z0-9._-]+$/.test(item.filename)) throw new Error('Invalid media path');
  return path.join(SUB_DIRS[item.category], item.filename);
}
let client;
async function s3() {
  const sdk = await import('@aws-sdk/client-s3');
  if (!STORAGE_CONFIG.s3.bucket || !STORAGE_CONFIG.s3.publicDomain) throw new Error('S3 bucket and public domain are required');
  client ||= new sdk.S3Client({ region: STORAGE_CONFIG.s3.region, endpoint: STORAGE_CONFIG.s3.endpoint,
    forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === 'true' });
  return { sdk, client };
}
export async function validateFile(file) {
  const detected = await fileTypeFromBuffer(file.buffer);
  if (!detected || !allowed.has(detected.mime) || detected.mime !== file.mimetype)
    throw Object.assign(new Error('File tidak didukung. Gunakan JPG, PNG, WebP, GIF, PDF, MP4, atau WebM dengan isi yang sesuai.'), { status: 400 });
  return detected;
}
export async function uploadFile(file, driver = STORAGE_CONFIG.driver) {
  const detected = await validateFile(file);
  const category = getFileCategory(detected.mime);
  const filename = `${randomUUID()}.${detected.ext}`;
  const item = { id: randomUUID(), filename, originalName: path.basename(file.originalname).slice(0,255), category,
    mimetype: detected.mime, size: file.buffer.length, formattedSize: formatBytes(file.buffer.length),
    uploadedAt: new Date().toISOString(), formattedDate: new Date().toLocaleDateString('id-ID'), storageDriver: driver };
  if (driver === 's3') {
    const { sdk, client: storageClient } = await s3();
    item.s3Key = `media/${category}/${filename}`;
    await storageClient.send(new sdk.PutObjectCommand({ Bucket: STORAGE_CONFIG.s3.bucket, Key: item.s3Key, Body: file.buffer, ContentType: detected.mime }));
    item.url = `${STORAGE_CONFIG.s3.publicDomain.replace(/\/$/,'')}/${item.s3Key}`;
  } else {
    fs.writeFileSync(localPath(item), file.buffer, {flag:'wx'});
    item.url = `/uploads/${category}/${filename}`;
  }
  return item;
}
export async function deleteStoredFile(item) {
  if (item.storageDriver === 's3') {
    if (item.s3Key !== `media/${item.category}/${item.filename}`) throw new Error('Invalid S3 key');
    localPath(item); // Validate category and basename for both storage providers.
    const { sdk, client: storageClient } = await s3();
    await storageClient.send(new sdk.DeleteObjectCommand({ Bucket: STORAGE_CONFIG.s3.bucket, Key: item.s3Key }));
  } else {
    fs.rmSync(localPath(item), {force:true});
  }
}
