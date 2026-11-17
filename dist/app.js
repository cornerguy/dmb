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
    "https://dmf-bay.vercel.app"
]);
app.use(cors({
    origin(origin, callback) {
        if (STATIC_ORIGINS.has(origin || "")) {
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
