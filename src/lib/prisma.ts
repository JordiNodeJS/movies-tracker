import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL?.replace(/\\n/g, "")
    .replace(/\"/g, "")
    .trim();
  if (!connectionString) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is not set in production.");
    }
    console.warn(
      "DATABASE_URL is not set. Prisma client will be initialized without a connection string."
    );
    return new PrismaClient();
  }

  console.log("Initializing Prisma with Neon adapter...");

  const pool = new Pool({
    connectionString: connectionString,
  });
  const adapter = new PrismaNeon(pool as any);

  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
