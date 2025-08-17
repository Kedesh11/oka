import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

// Resolve an absolute path to the SQLite database to avoid CWD issues in Next.js
const dbAbsolutePath = path.resolve(process.cwd(), "prisma/dev.db");
const dbExists = fs.existsSync(dbAbsolutePath);

const prismaClientSingleton = () =>
  new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbAbsolutePath}`,
      },
    },
  });

// Use globalThis to avoid creating multiple instances in dev HMR
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  // Log once in dev to verify the DB path actually used
  // eslint-disable-next-line no-console
  console.log("[Prisma] SQLite DB path:", dbAbsolutePath, "exists:", dbExists);
  if (!dbExists) {
    console.error("[Prisma] SQLite DB file not found at:", dbAbsolutePath);
  }
  globalThis.prismaGlobal = prisma;
}
