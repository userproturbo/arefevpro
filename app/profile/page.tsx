"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchUser() {
      try {
        const res = await fetch("/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        router.push("/login");
      }
    }

    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p className="text-xl">Загрузка...</p>
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
          localStorage.removeItem("token");
          router.push("/login");
        }}
      >
        Выйти
      </button>
    </div>
  );
}
