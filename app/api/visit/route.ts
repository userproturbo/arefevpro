import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const VISITOR_COOKIE = "visitor_id";
const VISIT_COOLDOWN_MINUTES = 15;

export const dynamic = "force-dynamic";

async function createVisitorCookie(id: string) {
  const cookieStore = await cookies();
  cookieStore.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}

export async function POST() {
  try {
    const now = Date.now();
    const cutoff = new Date(now - VISIT_COOLDOWN_MINUTES * 60 * 1000);
    const cookieStore = await cookies();

    let visitorId = cookieStore.get(VISITOR_COOKIE)?.value || null;

    if (!visitorId) {
      visitorId = crypto.randomUUID();
      await createVisitorCookie(visitorId);
      await prisma.visitor.create({ data: { id: visitorId } });
    } else {
      await prisma.visitor.upsert({
        where: { id: visitorId },
        update: {},
        create: { id: visitorId },
      });
    }

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

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Visit tracking error:", error);
    return NextResponse.json(
      { error: "Failed to record visit" },
      { status: 500 }
    );
  }
}
