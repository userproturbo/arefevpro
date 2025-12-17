import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number };
  } catch {
    return null;
  }
}

export function signToken(payload: { id: number } & Record<string, unknown>) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}
