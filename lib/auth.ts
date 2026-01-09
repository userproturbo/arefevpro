import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const AUTH_COOKIE = "auth_token";

export type ApiUser = {
  id: number;
  role: "ADMIN" | "USER";
};

export async function getApiUser(): Promise<ApiUser | null> {
  const cookieStore = await cookies(); // ⬅️ ВАЖНО
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) return null;

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as ApiUser;

    return payload;
  } catch {
    return null;
  }
}
