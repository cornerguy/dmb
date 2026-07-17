import jwt from "jsonwebtoken";
import { JWT_ACCESS_EXPIRES_IN, JWT_ACCESS_SECRET, JWT_ALGO, JWT_REFRESH_EXPIRES_IN, JWT_REFRESH_SECRET } from "../env.js";
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_ACCESS_SECRET, {
        expiresIn: String(JWT_ACCESS_EXPIRES_IN),
        algorithm: JWT_ALGO
    });
};
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: String(JWT_REFRESH_EXPIRES_IN),
        algorithm: JWT_ALGO
    });
};
export const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
        return decoded;
    }
    catch {
        return null;
    }
};
export const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
        return decoded;
    }
    catch {
        return null;
    }
};
