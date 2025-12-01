"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const data = await res.json();
        setUser((data.user || null) as User | null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p className="text-xl">Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p className="text-xl">Вы не авторизованы</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-6">Профиль</h1>

      <div className="bg-zinc-900 p-8 rounded-xl shadow-xl w-full max-w-md text-lg">
        <p><span className="text-zinc-400">Имя:</span> {user.name}</p>
        <p><span className="text-zinc-400">Email:</span> {user.email}</p>
        <p><span className="text-zinc-400">ID:</span> {user.id}</p>
      </div>

      <button
        className="mt-8 p-3 bg-red-600 hover:bg-red-700 rounded"
        onClick={() => {
          window.location.href = "/login";
        }}
      >
        Выйти
      </button>
    </div>
  );
}
