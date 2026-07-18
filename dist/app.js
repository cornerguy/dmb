import express from "express";
import cors from "cors";
import errorMiddleware from "./middleware/error.middleware.js";
import HealthRouter from "./routes/health.routes.js";
import { ErrorResponse } from "./utils/Error-Response.js";
import restaurantRouter from "./routes/restaurant.routes.js";
import categoryRouter from "./routes/category.routes.js";
import itemRouter from "./routes/items.routes.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { prisma } from "./lib/prisma.js";
const app = express();
const STATIC_ORIGINS = new Set([
    "http://localhost:3000",
    "http://localhost:5173",
]);
let allowedOrigins = new Set([""]);
export async function refreshOrigins() {
    const restaurants = await prisma.restaurant.findMany({
        select: { domain: true },
        where: { domain: { not: "" } },
    });
    allowedOrigins = new Set((restaurants ?? []).map(r => r.domain));
    console.log(`[CORS] Refreshed ${allowedOrigins.size} dynamic origins`);
}
app.use(cors({
    origin(origin, callback) {
        console.loh(allowedOrigins);
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.has(origin) || STATIC_ORIGINS.has(origin)) {
            return callback(null, true);
        }
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
app.use(helmet({
    crossOriginResourcePolicy: false
}));
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
    standardHeaders: 'draft-8',
    legacyHeaders: false,
});
app.use(limiter);
app.use(cookieParser());
app.use(express.json({ limit: "16KB" }));
app.use(express.urlencoded({ extended: true, limit: "16KB" }));
app.use("/api/v1/health", HealthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/restaurant", restaurantRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/item", itemRouter);
app.use((req, res) => {
    console.log(req.url);
    res.json(new ErrorResponse(404, "INVALID API"));
});
app.use(errorMiddleware);
export default app;
