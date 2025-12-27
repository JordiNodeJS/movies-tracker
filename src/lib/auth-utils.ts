import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const SECRET_KEY = process.env.JWT_SECRET || "super-secret-key-change-this";

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

export function signJWT(payload: Record<string, any>): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");
  const body = Buffer.from(
    JSON.stringify({ ...payload, iat: Date.now() })
  ).toString("base64url");
  const signature = createHmac("sha256", SECRET_KEY)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

export function verifyJWT(token: string): Record<string, any> | null {
  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) return null;

    const expectedSignature = createHmac("sha256", SECRET_KEY)
      .update(`${header}.${body}`)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    return JSON.parse(Buffer.from(body, "base64url").toString());
  } catch (e) {
    return null;
  }
}
