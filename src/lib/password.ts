import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [hash, salt] = storedHash.split(".");
  const hashBuf = Buffer.from(hash, "hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(hashBuf, buf);
}
