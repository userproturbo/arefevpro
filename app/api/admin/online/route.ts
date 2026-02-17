import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toSafeNumber(value: unknown): number {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export async function GET() {
  try {
    const user = await getApiUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const onlineCutoff = new Date(Date.now() - 2 * 60 * 1000);

    const [onlineUsers, anonymousOnlineRaw] = await Promise.all([
      prisma.user.findMany({
        where: {
          status: "ACTIVE",
          lastSeenAt: {
            gt: onlineCutoff,
          },
        },
        orderBy: { lastSeenAt: "desc" },
        select: {
          id: true,
          email: true,
          login: true,
          nickname: true,
          role: true,
          lastSeenAt: true,
        },
      }),
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT "visitorId")::bigint AS count
        FROM "Visit"
        WHERE "createdAt" >= ${onlineCutoff}
          AND "userId" IS NULL
      `,
    ]);

    return NextResponse.json({
      onlineUsers,
      onlineUsersCount: onlineUsers.length,
      anonymousOnlineCount: toSafeNumber(anonymousOnlineRaw[0]?.count),
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin online error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("Admin online error:", error);
    return NextResponse.json({ error: "Failed to load online users" }, { status: 500 });
  }
}
