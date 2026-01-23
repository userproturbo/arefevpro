import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { getStorageMode } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const mode = getStorageMode();
  return NextResponse.json({ mode });
}
