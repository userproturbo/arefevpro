import jwt from "jsonwebtoken";

export function verifyToken(token?: string) {
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      email: string;
    };
  } catch {
    return null;
  }
}
