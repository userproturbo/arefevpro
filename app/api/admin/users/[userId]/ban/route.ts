import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseUserId(raw: string) {
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.floor(value);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (authUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { userId: rawUserId } = await context.params;
    const userId = parseUserId(rawUserId);
    if (!userId) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    if (userId === authUser.id) {
      return NextResponse.json({ error: "You cannot ban yourself" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as { reason?: unknown };
    const reason =
      typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "";

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (target.role === "ADMIN") {
      return NextResponse.json({ error: "Cannot ban admin user" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: target.id },
      data: {
        status: "BANNED",
        bannedAt: new Date(),
        banReason: reason || null,
        lastSeenAt: null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Ban user error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("Ban user error:", error);
    return NextResponse.json({ error: "Failed to ban user" }, { status: 500 });
  }
}
