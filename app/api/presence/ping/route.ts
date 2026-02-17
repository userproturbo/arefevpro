import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import { isExpectedDevDatabaseError } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const user = await getApiUser();
    if (!user) {
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
