import { asyncHandler } from "./asyncHandeler.js";
import bcrypt from "bcryptjs";
import { CORNERAUTHSECRET } from "../env.js";
export const CornerLock = asyncHandler(async (req, res, next) => {
    if (!CORNERAUTHSECRET) {
        return res.status(503).json({ msg: "Server misconfiguration" });
    }
    const secret_key = req.headers['x-tempdata'];
    if (!secret_key || typeof secret_key !== "string") {
        return res.status(400).json({ msg: "FUCK YOU A PEICE OF SHIT!" });
    }
    let valid = false;
    try {
        valid = await bcrypt.compare(secret_key, CORNERAUTHSECRET);
    }
    catch {
        valid = false;
    }
    if (valid) {
        next();
    }
    else {
        return res.status(400).json({ msg: "FUCK YOU A PEICE OF SHIT!" });
    }
});
