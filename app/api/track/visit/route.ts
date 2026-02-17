import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import { isExpectedDevDatabaseError } from "@/lib/db";

const VISITOR_COOKIE = "visitor_id";
const VISIT_COOLDOWN_MINUTES = 45;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VISITOR_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 180,
  path: "/",
};

function normalizePath(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed.startsWith("/")) return null;
  return trimmed.slice(0, 512);
}

async function getPathFromRequest(req: NextRequest): Promise<string | null> {
  try {
    const body = await req.json();
    return normalizePath(body?.path);
  } catch {
    return null;
  }
}

async function recordVisit(visitorId: string, userId: number | null, path: string | null) {
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
      orderBy: { createdAt: "desc" },
    });

    if (!recentVisit) {
      await prisma.visit.create({
        data: {
          visitorId,
          userId,
          path,
        },
      });
    }
  } catch (error) {
    if (isExpectedDevDatabaseError(error)) return;
    console.error("Visit tracking error:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    if (process.env.DISABLE_VISIT_TRACKING === "1") {
      return new NextResponse(null, { status: 204 });
    }

    const [apiUser, path] = await Promise.all([getApiUser(), getPathFromRequest(req)]);
    const existingVisitorId = req.cookies.get(VISITOR_COOKIE)?.value || null;
    const visitorId = existingVisitorId || crypto.randomUUID();

    const response = new NextResponse(null, { status: 204 });

    if (!existingVisitorId) {
      response.cookies.set(VISITOR_COOKIE, visitorId, VISITOR_COOKIE_OPTIONS);
    }

    void recordVisit(visitorId, apiUser?.id ?? null, path);

    return response;
  } catch (error) {
    if (!isExpectedDevDatabaseError(error)) {
      console.error("Visit route error:", error);
    }
    return new NextResponse(null, { status: 204 });
  }
}
