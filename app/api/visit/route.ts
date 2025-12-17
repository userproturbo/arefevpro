import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VISITOR_COOKIE = "visitor_id";
const VISIT_COOLDOWN_MINUTES = 15;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VISITOR_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 365,
  path: "/",
};

async function recordVisit(visitorId: string) {
  try {
    const now = Date.now();
    const cutoff = new Date(now - VISIT_COOLDOWN_MINUTES * 60 * 1000);

    await prisma.visitor.upsert({
      where: { id: visitorId },
      update: {},
      create: { id: visitorId },
    });

    const recentVisit = await prisma.visit.findFirst({
      where: {
        visitorId,
        createdAt: { gte: cutoff },
      },
      select: { id: true },
    });

    if (!recentVisit) {
      await prisma.visit.create({ data: { visitorId } });
    }
  } catch (error) {
    console.error("Visit tracking error:", error);
  }
}

export async function POST(req: NextRequest) {
  const existingVisitorId = req.cookies.get(VISITOR_COOKIE)?.value || null;
  const visitorId = existingVisitorId || crypto.randomUUID();

  const response = new NextResponse(null, { status: 200 });
  if (!existingVisitorId) {
    response.cookies.set(VISITOR_COOKIE, visitorId, VISITOR_COOKIE_OPTIONS);
  }

  void recordVisit(visitorId);

  return response;
}
