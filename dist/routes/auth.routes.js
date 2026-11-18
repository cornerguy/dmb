import { Router } from "express";
import rateLimit from "express-rate-limit";
import { deleteAdmin, getAllAdmins, login, logout, refresh, register, updateRestaurant } from "../controllers/auth.controller.js";
import { CornerLock } from '../utils/CornerLock.js';
const authRouter = Router();
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many authentication attempts, please try again later.",
    standardHeaders: "draft-8",
    legacyHeaders: false,
});
authRouter.route("/register").post(CornerLock, register);
authRouter.route("/updateAdmin/:restaurantPublicId").put(CornerLock, updateRestaurant);
authRouter.route("/getAllAdmins").get(CornerLock, getAllAdmins);
authRouter.route("/delete/:publicId").delete(CornerLock, deleteAdmin);
authRouter.route("/login").post(authLimiter, login);
authRouter.route("/refresh").post(authLimiter, refresh);
authRouter.route("/logout").post(logout).delete(logout);
export default authRouter;
