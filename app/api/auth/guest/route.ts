import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: "Гостевой вход отключен" },
    { status: 403 }
  );
}
