import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { PostType } from "@prisma/client";

const ALLOWED_TYPES: PostType[] = ["photo", "video", "text", "music"];

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies(); // Next.js 16 — async cookies()
    const token = cookieStore.get("token")?.value;

    const payload = verifyToken(token);

    // Только ты можешь создавать посты
    if (!payload) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const { type, title, content, mediaUrl } = await req.json();

    const postType = ALLOWED_TYPES.find((t) => t === type);

    if (!postType || !title) {
      return NextResponse.json(
        { error: "Тип и заголовок обязательны" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        type: postType,
        title,
        content: content || null,
        mediaUrl: mediaUrl || null,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
