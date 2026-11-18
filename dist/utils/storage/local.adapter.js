import fs from 'fs/promises';
import path from 'path';
import { UPLOAD_ROOT, UPLOAD_PUBLIC_BASE } from '../../env.js';
export class LocalStorageAdapter {
    async upload(buffer, key) {
        if (!UPLOAD_ROOT) {
            throw new Error('UPLOAD_ROOT is not configured');
        }
        const root = path.resolve(UPLOAD_ROOT);
        const dest = path.resolve(root, key);
        const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
        if (dest !== root && !dest.startsWith(rootWithSep)) {
            throw new Error('Invalid upload path');
        }
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.writeFile(dest, buffer);
    }
    async delete(key) {
        if (!UPLOAD_ROOT)
            return;
        const root = path.resolve(UPLOAD_ROOT);
        const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
        const base = (UPLOAD_PUBLIC_BASE || '').endsWith('/')
            ? (UPLOAD_PUBLIC_BASE || '').slice(0, -1)
            : (UPLOAD_PUBLIC_BASE || '');
        let withoutBase = base && key.startsWith(base) ? key.slice(base.length) : key;
        withoutBase = withoutBase.replace(/^\/+/, '');
        let relative;
        try {
            relative = decodeURIComponent(withoutBase);
        }
        catch {
            return;
        }
        if (!relative || relative.includes('\0'))
            return;
        const resolved = path.resolve(root, relative);
        if (resolved === root || !resolved.startsWith(rootWithSep)) {
            return;
        }
        await fs.unlink(resolved).catch(() => { });
    }
    getPublicUrl(key) {
        const base = UPLOAD_PUBLIC_BASE?.endsWith('/') ? UPLOAD_PUBLIC_BASE.slice(0, -1) : UPLOAD_PUBLIC_BASE;
        const clean = key.startsWith('/') ? key.slice(1) : key;
        return `${base}/${clean}`;
    }
}
