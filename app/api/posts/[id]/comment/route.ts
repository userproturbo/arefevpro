import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // NEW — ждём params!

    const postId = Number(id);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Неверный ID поста" }, { status: 400 });
    }

    const { authorName, authorEmail, message } = await request.json();

    if (!authorName || !message) {
      return NextResponse.json(
        { error: "Имя и сообщение обязательны" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json(
        { error: "Пост не найден" },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        postId: postId,
        authorName,
        authorEmail: authorEmail || null,
        message,
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
