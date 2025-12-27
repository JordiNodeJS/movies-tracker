import { Pool } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL;
console.log("Testing connection to:", connectionString?.split("@")[1]);

const pool = new Pool({ connectionString });

async function test() {
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT NOW()");
    console.log("Success:", res.rows[0]);
    await client.release();
  } catch (err) {
    console.error("Failure:", err);
  } finally {
    await pool.end();
  }
}

test();
