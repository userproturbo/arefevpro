import { NextRequest } from "next/server";
import { POST as trackVisitPost } from "@/app/api/track/visit/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return trackVisitPost(req);
}
