import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
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
        const normalized = path.posix.normalize(key).replace(/^\/+/, '');
        if (!normalized || normalized === '.' || normalized.startsWith('..') || normalized.includes('\0')) {
            throw new Error('Invalid upload key');
        }
        await client.send(new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: normalized,
            Body: buffer,
            ContentType: 'image/webp',
            CacheControl: 'public, max-age=31536000, immutable',
        }));
    }
    async delete(key) {
        const base = (S3_PUBLIC_URL_BASE || '').endsWith('/')
            ? (S3_PUBLIC_URL_BASE || '').slice(0, -1)
            : (S3_PUBLIC_URL_BASE || '');
        let withoutBase = base && key.startsWith(base) ? key.slice(base.length) : key;
        withoutBase = withoutBase.replace(/^\/+/, '');
        let objectKey;
        try {
            objectKey = decodeURIComponent(withoutBase);
        }
        catch {
            return;
        }
        const normalized = path.posix.normalize(objectKey).replace(/^\/+/, '');
        if (!normalized || normalized === '.' || normalized.startsWith('..') || normalized.includes('\0')) {
            return;
        }
        await client.send(new DeleteObjectCommand({
            Bucket: S3_BUCKET,
            Key: normalized,
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
