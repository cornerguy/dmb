import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { S3_REGION, S3_ACCESS_KEY_ID, S3_BUCKET, S3_SECRET_ACCESS_KEY, S3_PUBLIC_URL_BASE } from '../../env.js';
const client = new S3Client({
    region: S3_REGION || '',
    credentials: {
        accessKeyId: S3_ACCESS_KEY_ID || '',
        secretAccessKey: S3_SECRET_ACCESS_KEY || '',
    },
});
export class S3StorageAdapter {
    async upload(buffer, key) {
        await client.send(new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: 'image/webp',
            CacheControl: 'public, max-age=15552000',
        }));
    }
    async delete(key) {
        await client.send(new DeleteObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
        }));
    }
    getPublicUrl(key) {
        const base = (S3_PUBLIC_URL_BASE || '').endsWith('/')
            ? (S3_PUBLIC_URL_BASE || '').slice(0, -1)
            : (S3_PUBLIC_URL_BASE || '');
        const clean = key.startsWith('/') ? key.slice(1) : key;
        return `${base}/${clean}`;
    }
}
