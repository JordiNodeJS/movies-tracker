// Jest setup file
import dotenv from "dotenv";
import path from "path";

// Load environment variables before tests run
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Increase timeout for database operations
jest.setTimeout(30000);
