import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set!");
    console.error(
      "Available env vars:",
      Object.keys(process.env).filter((k) => k.includes("DATABASE"))
    );
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("✅ DATABASE_URL found, length:", connectionString.length);
  console.log("✅ Creating Neon Pool with connection string");

  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool as any);
  return new PrismaClient({ adapter });
};

declare global {
  var prismaInstance: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaInstance ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaInstance = prisma;
}
