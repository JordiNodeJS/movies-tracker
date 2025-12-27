import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
  throw new Error(
    "JWT_SECRET environment variable is not defined. Please set it in your .env file for security."
  );
}

const secret = new TextEncoder().encode(SECRET_KEY);

export async function signJWT(payload: Record<string, any>): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyJWT(
  token: string
): Promise<Record<string, any> | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (e) {
    return null;
  }
}
