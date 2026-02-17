import { NextResponse } from "next/server";
import type { AuthUser } from "@/lib/auth";

export function isBannedUser(user: Pick<AuthUser, "status"> | null | undefined) {
  return user?.status === "BANNED";
}

export function bannedUserResponse(reason: string | null) {
  return NextResponse.json({ error: "User is banned", reason }, { status: 403 });
}
