import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
export const connectdb = async () => {
    try {
        await prisma.$connect();
        return true;
    }
    catch (error) {
        console.log(error);
    }
};
export const disconnect = asyncHandler(async () => {
    await prisma.$disconnect();
    return true;
});
