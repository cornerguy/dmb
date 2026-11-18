import { prisma } from "../lib/prisma.js";
export const connectdb = async () => {
    await prisma.$connect();
    return true;
};
export const disconnect = async () => {
    await prisma.$disconnect();
    return true;
};
