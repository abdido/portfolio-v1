/**
 * S3 / Cloudflare R2 Migration Script
 *
 * Usage:
 * 1. Install AWS SDK: npm install @aws-sdk/client-s3
 * 2. Set environment variables:
 *    - AWS_ACCESS_KEY_ID
 *    - AWS_SECRET_ACCESS_KEY
 *    - AWS_S3_BUCKET_NAME
 *    - AWS_REGION
 *    - AWS_S3_ENDPOINT (Optional for Cloudflare R2 / MinIO)
 * 3. Run: node server/storage/migrateToS3.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { UPLOADS_DIR, STORAGE_CONFIG } from './storageAdapter.js';
import { readDB, writeDB } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  console.log('🚀 Starting Media Migration to S3 / Cloudflare R2...');

  if (!STORAGE_CONFIG.s3.accessKeyId || !STORAGE_CONFIG.s3.secretAccessKey) {
    console.error('❌ Error: S3 credentials are not configured.');
    console.log('Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME in your environment.');
    process.exit(1);
  }

  try {
    // Dynamic import for optional AWS SDK
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

    const s3Client = new S3Client({
      region: STORAGE_CONFIG.s3.region,
      endpoint: STORAGE_CONFIG.s3.endpoint || undefined,
      credentials: {
        accessKeyId: STORAGE_CONFIG.s3.accessKeyId,
        secretAccessKey: STORAGE_CONFIG.s3.secretAccessKey
      }
    });

    const db = readDB();
    const mediaList = db.media || [];

    console.log(`Found ${mediaList.length} media items in database.`);

    let successCount = 0;

    for (const item of mediaList) {
      if (item.storageDriver === 's3') {
        console.log(`⏩ Skipping already migrated file: ${item.filename}`);
        continue;
      }

      const localFilePath = path.join(UPLOADS_DIR, item.category || 'others', item.filename);

      if (!fs.existsSync(localFilePath)) {
        console.warn(`⚠️ Local file not found on disk: ${localFilePath}`);
        continue;
      }

      const fileBuffer = fs.readFileSync(localFilePath);
      const s3Key = `media/${item.category}/${item.filename}`;

      console.log(`⬆️ Uploading ${item.filename} to s3://${STORAGE_CONFIG.s3.bucket}/${s3Key}...`);

      await s3Client.send(new PutObjectCommand({
        Bucket: STORAGE_CONFIG.s3.bucket,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: item.mimetype,
        ACL: 'public-read'
      }));

      // Update database URL to S3 domain
      const publicBase = STORAGE_CONFIG.s3.publicDomain || `https://${STORAGE_CONFIG.s3.bucket}.s3.${STORAGE_CONFIG.s3.region}.amazonaws.com`;
      item.url = `${publicBase}/${s3Key}`;
      item.storageDriver = 's3';
      item.s3Key = s3Key;

      successCount++;
    }

    writeDB(db);
    console.log(`✅ Successfully migrated ${successCount} files to S3! Database updated.`);
  } catch (error) {
    console.error('❌ Migration failed with error:', error);
  }
}

// Execute if run directly from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate();
}

export default migrate;
