import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export type AuthTokenPayload = JwtPayload & {
  id: number;
  role: "USER" | "ADMIN";
};

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || typeof decoded !== "object") return null;

    const payload = decoded as Partial<AuthTokenPayload>;
    if (typeof payload.id !== "number") return null;
    if (payload.role !== "USER" && payload.role !== "ADMIN") return null;

    return payload as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function signToken(payload: { id: number; role: "USER" | "ADMIN" }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}
