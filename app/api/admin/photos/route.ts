import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * HOTFIX:
 * Photo upload temporarily disabled.
 * This endpoint will be re-enabled in a separate PR
 * once Photo schema & upload flow are finalized.
 */
export async function POST(_req: NextRequest) {
  const authUser = await getCurrentUser();

  if (!authUser) {
    return NextResponse.json(
      { error: "Требуется авторизация" },
      { status: 401 }
    );
  }

  if (authUser.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Нет прав доступа" },
      { status: 403 }
    );
  }

  return NextResponse.json(
    {
      error: "Загрузка фотографий временно отключена",
    },
    { status: 503 }
  );
}
