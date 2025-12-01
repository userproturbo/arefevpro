"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const data = await res.json();

        // только твой аккаунт видит navbar
        setIsAuthor(data?.user?.id === 1);
      } catch {
        setIsAuthor(false);
      }
    }

    check();
  }, []);

  // если не ты — nav вообще не показывается
  if (!isAuthor) return null;

  return (
    <header className="border-b border-gray-800">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold">
          MyCrazyLife
        </Link>

        <nav className="flex gap-4 text-gray-300">
          <Link href="/" className="hover:text-white">Главная</Link>
          <Link href="/create" className="hover:text-white">Создать</Link>
          <Link href="/profile" className="hover:text-white">Профиль</Link>
          <Link href="/login" className="hover:text-white">Выйти</Link>
        </nav>
      </div>
    </header>
  );
}
