import { asyncHandler } from "./asyncHandeler.js";
import bcrypt from "bcryptjs";
import { CORNERAUTHSECRET } from "../env.js";
export const CornerLock = asyncHandler(async (req, res, next) => {
    const secret_key = req.headers['x-tempdata'];
    const valid = await bcrypt.compare(String(secret_key) || "", CORNERAUTHSECRET || "");
    if (valid) {
        next();
    }
    else {
        return res.status(400).json({ msg: "FUCK YOU A PEICE OF SHIT!" });
    }
});
