import "dotenv/config";
import * as dotenv from "dotenv";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hashPassword } from "./src/lib/password";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  const adapter = new PrismaNeon(
    { connectionString: dbUrl },
    { schema: "movies-tracker" }
  );
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("🔍 Cleaning up test user...");
    await prisma.user.deleteMany({
      where: { email: "testuser2024@demo.com" },
    });
    console.log("✅ Test user deleted");

    console.log("🔐 Creating new test user with known credentials...");
    const testEmail = "e2e@moviestracker.com";
    const testPassword = "TestPassword123!";

    const hashedPassword = await hashPassword(testPassword);
    console.log("Hash created:", hashedPassword.substring(0, 20) + "...");

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
      },
    });

    console.log("✅ User created successfully!");
    console.log(`📧 Email: ${testEmail}`);
    console.log(`🔑 Password: ${testPassword}`);
    console.log(`👤 User ID: ${user.id}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
