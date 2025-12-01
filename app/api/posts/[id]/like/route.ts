import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const postId = Number(id);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Неверный ID поста" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    const like = await prisma.like.create({
      data: { postId },
    });

    const count = await prisma.like.count({ where: { postId } });

    return NextResponse.json({ like, likesCount: count }, { status: 201 });
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
