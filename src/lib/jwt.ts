import { SignJWT, jwtVerify } from "jose";

/**
 * Gets the JWT secret as a Uint8Array.
 * Returns null if the secret is not defined.
 */
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return null;
  }
  return new TextEncoder().encode(secret);
}

export async function signJWT(payload: Record<string, any>): Promise<string> {
  const secret = getSecret();
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined.");
  }

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyJWT(
  token: string
): Promise<Record<string, any> | null> {
  if (!token) return null;

  const secret = getSecret();
  if (!secret) {
    console.error("JWT_SECRET is not defined in environment variables");
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (e) {
    // Token is invalid, expired, or malformed
    return null;
  }
}
