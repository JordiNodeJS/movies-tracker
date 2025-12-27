import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const result = await sql`SELECT version()`;
  console.log(result);
}

main().catch(console.error);
