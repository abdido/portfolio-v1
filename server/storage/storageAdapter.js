import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base Upload Directory
export const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Subdirectories for structured organization
export const SUB_DIRS = {
  images: path.join(UPLOADS_DIR, 'images'),
  videos: path.join(UPLOADS_DIR, 'videos'),
  documents: path.join(UPLOADS_DIR, 'documents'),
  others: path.join(UPLOADS_DIR, 'others')
};

// Ensure all upload directories exist
export const ensureUploadDirectories = () => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  Object.values(SUB_DIRS).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Determine category based on MIME type or extension
export const getFileCategory = (mimetype, filename = '') => {
  if (mimetype.startsWith('image/')) return 'images';
  if (mimetype.startsWith('video/')) return 'videos';
  if (
    mimetype.startsWith('application/pdf') ||
    mimetype.includes('word') ||
    mimetype.includes('document') ||
    mimetype.includes('sheet') ||
    mimetype.includes('presentation') ||
    mimetype.startsWith('text/') ||
    mimetype.includes('zip') ||
    mimetype.includes('tar')
  ) {
    return 'documents';
  }
  
  // Extension fallback
  const ext = path.extname(filename).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.ico'].includes(ext)) return 'images';
  if (['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'].includes(ext)) return 'videos';
  if (['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar'].includes(ext)) return 'documents';
  
  return 'others';
};

// Format bytes to human-readable size (KB, MB, GB)
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Storage Configuration & S3 Migration Settings
 * Change STORAGE_DRIVER to 's3' when ready to switch to AWS S3 / Cloudflare R2 / MinIO.
 */
export const STORAGE_CONFIG = {
  driver: process.env.STORAGE_DRIVER || 'local', // 'local' | 's3'
  baseUrl: process.env.STORAGE_BASE_URL || '/uploads',
  s3: {
    endpoint: process.env.AWS_S3_ENDPOINT || '', // e.g. https://<accountid>.r2.cloudflarestorage.com for Cloudflare R2
    region: process.env.AWS_REGION || 'auto',
    bucket: process.env.AWS_S3_BUCKET_NAME || 'portfolio-media',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    publicDomain: process.env.AWS_S3_PUBLIC_DOMAIN || '' // e.g. https://media.houseofabdi.web.id
  }
};

/**
 * Delete a local file
 */
export const deleteLocalFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (error) {
    console.error('Error deleting local file:', error);
  }
  return false;
};
