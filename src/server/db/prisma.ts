import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => new PrismaClient();

// Use globalThis to avoid creating multiple instances in dev HMR
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
