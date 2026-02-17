import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import { isExpectedDevDatabaseError } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const apiUser = await getApiUser();
    if (!apiUser) {
      return new NextResponse(null, { status: 204 });
    }

    const user = await prisma.user.findUnique({
      where: { id: apiUser.id },
      select: { id: true, status: true },
    });
    if (!user || user.status === "BANNED") {
      return new NextResponse(null, { status: 204 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
      select: { id: true },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (!isExpectedDevDatabaseError(error)) {
      console.error("Presence ping error:", error);
    }
    return new NextResponse(null, { status: 204 });
  }
}
