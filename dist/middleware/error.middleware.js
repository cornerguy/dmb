import { ErrorResponse } from "../utils/Error-Response.js";
import { Prisma } from "../generated/prisma/client.js";
const errorMiddleware = (error, req, res, next) => {
    try {
        if (error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025") {
            const message = error.meta?.cause ?? "Resource not found";
            error = new ErrorResponse(404, message);
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002") {
            const fields = error.meta?.target?.join(", ") ?? "field";
            const message = `Duplicate value for unique ${fields}`;
            error = new ErrorResponse(400, message);
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2003") {
            const field = error.meta?.field_name ?? "field";
            const message = `Related record not found for ${field}`;
            error = new ErrorResponse(404, message);
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2015") {
            const message = "Required related record not found";
            error = new ErrorResponse(404, message);
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2006") {
            const message = `Invalid value provided for field: ${error.meta?.field_name ?? "unknown"}`;
            error = new ErrorResponse(400, message);
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2011") {
            const field = error.meta?.constraint ?? "field";
            const message = `Required field is missing: ${field}`;
            error = new ErrorResponse(400, message);
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2012") {
            const message = `Missing required value at: ${error.meta?.path ?? "unknown"}`;
            error = new ErrorResponse(400, message);
        }
        if (error instanceof Prisma.PrismaClientValidationError) {
            const message = "Invalid data provided. Please check your input.";
            error = new ErrorResponse(422, message);
        }
        if (error instanceof Prisma.PrismaClientInitializationError) {
            const message = "Database connection failed. Please try again later.";
            error = new ErrorResponse(503, message);
        }
        if (error instanceof Prisma.PrismaClientRustPanicError) {
            const message = "A critical database error occurred.";
            error = new ErrorResponse(500, message);
        }
        if (error instanceof Prisma.PrismaClientUnknownRequestError) {
            const message = "An unknown database error occurred.";
            error = new ErrorResponse(500, message);
        }
        res
            .status(error.statusCode || 500)
            .json(new ErrorResponse(error.statusCode || 500, error.message || "Internal Server Error", error.errors, error.stack));
    }
    catch (err) {
        console.error("CRITICAL ERROR IN ERROR HANDLER:", err);
        if (!res.headersSent) {
            res.status(500).json({
                status: 500,
                message: "Internal Server Error",
            });
        }
    }
};
export default errorMiddleware;
