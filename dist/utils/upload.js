import { storage } from "./storage/index.js";
import sharp from "sharp";
sharp.concurrency(2);
export const uploadImage = async (file, filelocation) => {
    try {
        const processed = await sharp(file, { limitInputPixels: 16_000_000 })
            .rotate()
            .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 75, effort: 4 })
            .toBuffer();
        await storage.upload(processed, filelocation);
        return storage.getPublicUrl(filelocation);
    }
    catch {
        return false;
    }
};
