import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN" || user.id !== 1) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalVisitors, totalVisits, visitsToday] =
      await Promise.all([
        prisma.visitor.count(),
        prisma.visit.count(),
        prisma.visit.findMany({
          where: {
            createdAt: { gte: startOfDay },
          },
          select: {
            visitorId: true,
          },
          distinct: ["visitorId"],
        }),
      ]);

    return NextResponse.json({
      totalVisitors,
      totalVisits,
      todayVisitors: visitsToday.length,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}
