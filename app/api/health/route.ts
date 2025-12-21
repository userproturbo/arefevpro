import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  warnDatabaseUnavailableOnce,
} from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      warnDatabaseUnavailableOnce("[api/health]", error);
      return NextResponse.json(
        { ok: false, error: getDatabaseUnavailableMessage() },
        { status: 503, headers: { "Retry-After": "1" } }
      );
    }

    console.error("[api/health] unexpected error", error);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

