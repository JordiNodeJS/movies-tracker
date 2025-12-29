import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import dotenv from "dotenv";
import path from "path";

// Ensure env vars are loaded
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const prismaClientSingleton = () => {
  console.log("🔍 Initializing Prisma Client with Neon HTTP adapter...");
  console.log(
    "🔍 process.env keys:",
    Object.keys(process.env).filter((k) => k.includes("DATA"))
  );

  const dbUrl = process.env.DATABASE_URL;
  console.log("🔍 DATABASE_URL type:", typeof dbUrl);
  console.log("🔍 DATABASE_URL value:", dbUrl);

  if (typeof dbUrl !== "string" || !dbUrl) {
    console.error("❌ DATABASE_URL is NOT a valid string in process.env");
    console.error("❌ Type:", typeof dbUrl);
    console.error("❌ Value:", dbUrl);
    throw new Error("DATABASE_URL is not set or invalid");
  }

  console.log("✅ DATABASE_URL found:", dbUrl.substring(0, 40) + "...");

  // Explicitly enforce movies-tracker schema
  const SCHEMA_NAME = "movies-tracker";
  console.log(`🔒 Enforcing schema: ${SCHEMA_NAME}`);

  try {
    // Create adapter with explicit schema configuration
    const adapter = new PrismaNeon(
      { connectionString: dbUrl },
      {
        schema: SCHEMA_NAME,
        // Additional options to ensure schema isolation
      }
    );

    // Create Prisma client with schema-enforcing raw query logging
    const client = new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });

    // Verify schema on initialization
    client.$connect().then(async () => {
      try {
        const result = await client.$queryRaw<
          Array<{ current_schema: string }>
        >`
          SELECT current_schema()::text as current_schema
        `;
        const currentSchema = result[0]?.current_schema;

        if (currentSchema !== SCHEMA_NAME) {
          console.warn(
            `⚠️ WARNING: Expected schema '${SCHEMA_NAME}' but got '${currentSchema}'`
          );
        } else {
          console.log(`✅ Connected to schema: ${currentSchema}`);
        }
      } catch (err) {
        console.error("❌ Failed to verify schema:", err);
      }
    });

    return client;
  } catch (error) {
    console.error("❌ Failed to initialize Prisma with Neon adapter:", error);
    throw error;
  }
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export { prisma };

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
