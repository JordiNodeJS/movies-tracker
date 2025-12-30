import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import dotenv from "dotenv";
import path from "path";
import { validateEnvironmentVariables } from "@/lib/env-validator";

// Ensure env vars are loaded
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Validate environment variables on startup
validateEnvironmentVariables();

const prismaClientSingleton = () => {
  console.log("🔍 Initializing Prisma Client with Neon HTTP adapter...");

  let dbUrl = process.env.DATABASE_URL;

  if (typeof dbUrl !== "string" || !dbUrl) {
    console.error("❌ DATABASE_URL is NOT a valid string in process.env");
    throw new Error("DATABASE_URL is not set or invalid");
  }

  // Clean up any trailing newline characters (from Vercel env injection)
  dbUrl = dbUrl.trim().replace(/\\n/g, "").replace(/\\r/g, "");

  console.log("✅ DATABASE_URL found:", dbUrl.substring(0, 40) + "...");

  // Explicitly enforce movies-tracker schema
  const SCHEMA_NAME = "movies-tracker";

  // Check if schema is already in the connection string with proper format
  const hasSearchPath =
    dbUrl.includes(`search_path%3D`) || dbUrl.includes(`search_path=`);

  if (!hasSearchPath) {
    console.log(`🔒 Adding schema to connection string: ${SCHEMA_NAME}`);
    // Add schema to connection string if not present - use encoded format for safety
    if (dbUrl.includes("?")) {
      // Remove trailing & if present
      if (dbUrl.endsWith("&")) {
        dbUrl = dbUrl.slice(0, -1);
      }
      dbUrl = dbUrl + `&options=-csearch_path%3D%22${SCHEMA_NAME}%22`;
    } else {
      dbUrl = dbUrl + `?options=-csearch_path%3D%22${SCHEMA_NAME}%22`;
    }
  } else {
    console.log(`🔒 Schema already in connection string: ${SCHEMA_NAME}`);
  }

  try {
    // Create adapter with explicit schema configuration
    const adapter = new PrismaNeon(
      { connectionString: dbUrl },
      {
        schema: SCHEMA_NAME,
      }
    );

    // Create Prisma client
    const client = new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });

    // Verify schema on initialization (only in development to avoid build delays)
    if (process.env.NODE_ENV === "development") {
      client.$connect().then(async () => {
        try {
          const result = await client.$queryRaw<
            Array<{ current_schema: string }>
          >`
            SELECT current_schema()::text as current_schema
          `;
          const currentSchema = result[0]?.current_schema;

          if (currentSchema === SCHEMA_NAME) {
            console.log(`✅ Connected to schema: ${currentSchema}`);
          } else {
            console.warn(
              `ℹ️  Currently in schema '${currentSchema}' (configured: '${SCHEMA_NAME}')`,
              "This is normal during static generation."
            );
          }
        } catch (err) {
          // Silently fail schema verification to avoid build errors
          console.log(
            "ℹ️  Schema verification skipped (expected during static generation)"
          );
        }
      });
    }

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
