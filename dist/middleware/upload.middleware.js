import multer from "multer";
const allowedImageTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "image/heic",
    "image/heif",
]);
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        allowedImageTypes.has(file.mimetype)
            ? cb(null, true)
            : cb(new Error('Only images allowed'));
    }
});
