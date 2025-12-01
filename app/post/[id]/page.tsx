"use client";

/* eslint-disable @next/next/no-img-element */
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type PostType = "photo" | "video" | "text" | "music";

interface PostComment {
  id: number;
  authorName: string;
  authorEmail?: string | null;
  message: string;
  createdAt: string;
}

interface Post {
  id: number;
  title?: string | null;
  type: PostType;
  content?: string | null;
  mediaUrl?: string | null;
  comments: PostComment[];
  _count: { likes: number };
}

export default function PostPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    async function load() {
      if (!id) return;
      const res = await fetch(`/api/posts/${id}`);
      const data = await res.json();
      setPost((data.post || null) as Post | null);
    }
    load();
  }, [id]);

  if (!post) return <p className="text-center p-6">Загрузка...</p>;

  async function sendComment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const res = await fetch(`/api/posts/${id}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: comment,
        authorName: name || "Гость",
      }),
    });

    if (res.ok) {
      setComment("");
      setName("");
      const updated = await fetch(`/api/posts/${id}`).then((r) => r.json());
      setPost((updated.post || null) as Post | null);
    } else {
      alert("Ошибка при отправке комментария");
    }
  }

  async function likePost() {
    await fetch(`/api/posts/${id}/like`, { method: "POST" });
    const updated = await fetch(`/api/posts/${id}`).then((r) => r.json());
    setPost((updated.post || null) as Post | null);
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">{post.title}</h1>

      {/* --- Фото --- */}
      {post.type === "photo" && post.mediaUrl && (
        <img src={post.mediaUrl} alt={post.title ?? "Фото"} className="rounded-xl w-full" />
      )}

      {/* --- Видео --- */}
      {post.type === "video" && post.mediaUrl && (
        <video controls className="rounded-xl w-full">
          <source src={post.mediaUrl} />
        </video>
      )}

      {/* --- Музыка --- */}
      {post.type === "music" && post.mediaUrl && (
        <audio controls className="w-full">
          <source src={post.mediaUrl} />
        </audio>
      )}

      {/* --- Текст --- */}
      {post.type === "text" && (
        <p className="text-lg leading-relaxed text-gray-200 whitespace-pre-line">
          {post.content}
        </p>
      )}

      {/* Лайки */}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={likePost}
          className="px-4 py-1 bg-white text-black rounded-lg"
        >
          ❤️ Лайк
        </button>
        <span className="text-gray-300">
          {post._count.likes} лайков
        </span>
      </div>

      {/* Комментарии */}
      <div className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Комментарии</h2>

        {/* Список */}
        {post.comments.length === 0 && (
          <p className="text-gray-400">Комментариев пока нет.</p>
        )}

        {post.comments.map((c: PostComment) => (
          <div
            key={c.id}
            className="bg-gray-900 border border-gray-700 p-3 rounded-xl"
          >
            <p className="font-semibold">{c.authorName}</p>
            <p className="text-gray-300">{c.message}</p>
            <span className="text-gray-500 text-sm">
              {new Date(c.createdAt).toLocaleString("ru-RU")}
            </span>
          </div>
        ))}
      </div>

      {/* Форма добавления комментария */}
      <form onSubmit={sendComment} className="space-y-4 pt-4">
        <input
          type="text"
          placeholder="Ваше имя"
          className="w-full p-2 rounded bg-gray-900 border border-gray-700"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          placeholder="Комментарий..."
          className="w-full p-3 rounded bg-gray-900 border border-gray-700 h-24"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button className="w-full py-2 bg-white text-black rounded-lg">
          Отправить комментарий
        </button>
      </form>
    </div>
  );
}
