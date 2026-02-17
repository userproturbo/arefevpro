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

    const now = Date.now();
    const last24hCutoff = new Date(now - 24 * 60 * 60 * 1000);
    const onlineCutoff = new Date(now - 2 * 60 * 1000);

    const [totalVisitorsRaw, uniqueLast24hRaw, visitsLast24h, totalUsers, users, onlineUsersCount, anonymousOnlineRaw] =
      await Promise.all([
        prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(DISTINCT "visitorId")::bigint AS count
          FROM "Visit"
        `,
        prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(DISTINCT "visitorId")::bigint AS count
          FROM "Visit"
          WHERE "createdAt" >= ${last24hCutoff}
        `,
        prisma.visit.count({
          where: {
            createdAt: { gte: last24hCutoff },
          },
        }),
        prisma.user.count(),
        prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            email: true,
            login: true,
            nickname: true,
            role: true,
            createdAt: true,
            lastSeenAt: true,
          },
        }),
        prisma.user.count({
          where: {
            lastSeenAt: {
              gt: onlineCutoff,
            },
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
      totalVisitors: toSafeNumber(totalVisitorsRaw[0]?.count),
      visitsLast24h,
      uniqueLast24h: toSafeNumber(uniqueLast24hRaw[0]?.count),
      totalUsers,
      users,
      onlineUsersCount,
      anonymousOnlineCount: toSafeNumber(anonymousOnlineRaw[0]?.count),
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Admin metrics error:", error);
      }
      return NextResponse.json(
        { error: getDatabaseUnavailableMessage() },
        { status: 503 }
      );
    }

    console.error("Admin metrics error:", error);
    return NextResponse.json({ error: "Failed to load metrics" }, { status: 500 });
  }
}
