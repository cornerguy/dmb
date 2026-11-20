import express from "express";
import cors from "cors";
import errorMiddleware from "./middleware/error.middleware.js";
import HealthRouter from "./routes/health.routes.js";
import { ErrorResponse } from "./utils/Error-Response.js";
import restaurantRouter from "./routes/restaurant.routes.js";
import categoryRouter from "./routes/category.routes.js";
import itemRouter from "./routes/items.routes.js";
import authRouter from "./routes/auth.routes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
const app = express();
const STATIC_ORIGINS = new Set([
    "http://localhost:3000",
    "http://192.168.1.12:3000",
    "http://localhost:5173",
]);
app.set("trust proxy", 1);
const corsError = (message) => {
    const error = new ErrorResponse(403, message);
    error.stack = undefined;
    return error;
};
app.use(cors({
    origin(origin, callback) {
        if (!origin) {
            return callback(null, true);
        }
        if (!STATIC_ORIGINS.has(origin)) {
            return callback(corsError("Origin not allowed"));
        }
        callback(null, true);
    },
    credentials: true,
}));
app.use(helmet({
    crossOriginResourcePolicy: false
}));
app.set("trust proxy", 1);
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: "Too many requests, please try again later.",
});
app.use(limiter);
app.use(express.json({ limit: "16KB" }));
app.use(express.urlencoded({ extended: true, limit: "16KB" }));
app.use("/api/v1/health", HealthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/restaurant", restaurantRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/item", itemRouter);
app.use((req, res) => {
    console.log(req.url);
    res.status(404).json(new ErrorResponse(404, "INVALID API"));
});
app.use(errorMiddleware);
export default app;
