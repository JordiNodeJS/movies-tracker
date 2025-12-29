import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
  console.log("prismaClientSingleton called. NODE_ENV:", process.env.NODE_ENV);
  const rawConnectionString = process.env.DATABASE_URL;
  console.log("Raw DATABASE_URL present:", !!rawConnectionString);

  const connectionString = rawConnectionString
    ?.replace(/\\n/g, "")
    .replace(/\"/g, "")
    .trim();

  if (connectionString) {
    console.log("Sanitized connection string length:", connectionString.length);
    console.log(
      "Sanitized connection string starts with:",
      connectionString.substring(0, 15) + "..."
    );
  }

  if (!connectionString) {
    console.error("DATABASE_URL is missing or empty after sanitization!");
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is not set in production.");
    }
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
