import { createHmac } from "node:crypto";

const SECRET_KEY = process.env.JWT_SECRET || "super-secret-key-change-this";

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
