"use client";

import HeroSection from "./components/HeroSection";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data.posts || []);
    }
    load();
  }, []);

  return (
    <div>
      {/* 🔥 Наш новый хедер */}
      <HeroSection />

      {/* Лента постов */}
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold mb-6">Мой блог</h1>

        {posts.length === 0 && (
          <p className="text-gray-400">Пока нет постов...</p>
        )}

        {posts.map((post: any) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="block bg-gray-900 border border-gray-700 rounded-xl p-4 hover:bg-gray-800 transition"
          >
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>

            {/* Фото */}
            {post.type === "photo" && post.mediaUrl && (
              <img
                src={post.mediaUrl}
                alt="photo"
                className="rounded-lg w-full mb-3"
              />
            )}

            {/* Видео */}
            {post.type === "video" && post.mediaUrl && (
              <video
                src={post.mediaUrl}
                controls
                className="rounded-lg w-full mb-3"
              />
            )}

            {/* Музыка */}
            {post.type === "music" && post.mediaUrl && (
              <audio
                src={post.mediaUrl}
                controls
                className="w-full mb-3"
              />
            )}

            {/* Текст */}
            {post.type === "text" && (
              <p className="text-gray-300 mb-3">
                {post.content?.slice(0, 200)}...
              </p>
            )}

            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>❤️ {post._count.likes}</span>
              <span>💬 {post._count.comments}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
