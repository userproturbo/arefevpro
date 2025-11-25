import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // MUST AWAIT in Next.js 16

    const postId = Number(id);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Неверный ID поста" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        comments: true,
        _count: {
          select: { likes: true }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Post GET error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
