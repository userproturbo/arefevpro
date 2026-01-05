"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";

interface User {
  id: number;
  login: string;
  nickname: string;
  role: "ADMIN" | "USER";
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { refresh } = useAuth();
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
        <p><span className="text-zinc-400">Логин:</span> {user.login}</p>
        <p><span className="text-zinc-400">Ник:</span> {user.nickname || user.login}</p>
        <p><span className="text-zinc-400">Роль:</span> {user.role}</p>
        <p><span className="text-zinc-400">ID:</span> {user.id}</p>
      </div>

      <button
        className="mt-8 p-3 bg-red-600 hover:bg-red-700 rounded"
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
          await refresh();
          router.push("/");
          router.refresh();
        }}
      >
        Выйти
      </button>
    </div>
  );
}
