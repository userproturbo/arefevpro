"use client";

import { FormEvent } from "react";
import { useState } from "react";

export default function CreatePage() {
  const [type, setType] = useState("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  async function createPost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const res = await fetch("/api/posts/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        title,
        content,
        mediaUrl,
      }),
    });

    if (res.ok) {
      alert("Пост создан!");
      window.location.href = "/";
    } else {
      const data = await res.json();
      alert("Ошибка: " + data.error);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Создать пост</h1>

      <form onSubmit={createPost} className="space-y-4">

        {/* Тип поста */}
        <div>
          <label className="block mb-2">Тип поста</label>
          <select
            className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="text">Текст</option>
            <option value="photo">Фото</option>
            <option value="video">Видео</option>
            <option value="music">Музыка</option>
          </select>
        </div>

        {/* Заголовок */}
        <div>
          <label className="block mb-2">Заголовок</label>
          <input
            type="text"
            className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название поста"
          />
        </div>

        {/* Контент (текст) */}
        {(type === "text" || type === "video" || type === "music") && (
          <div>
            <label className="block mb-2">Контент (описание или текст)</label>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 p-2 rounded h-32"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        )}

        {/* Media URL */}
        {(type === "photo" || type === "video" || type === "music") && (
          <div>
            <label className="block mb-2">Ссылка на медиа</label>
            <input
              type="text"
              className="w-full bg-gray-900 border border-gray-700 p-2 rounded"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        )}

        <button
          className="w-full bg-white text-black font-semibold py-2 rounded hover:bg-gray-200"
          type="submit"
        >
          Создать
        </button>
      </form>
    </div>
  );
}
