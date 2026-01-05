"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

export default function AdminLoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const { refresh } = useAuth();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const safeNext = typeof next === "string" && next.startsWith("/admin") ? next : "/admin";

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Неверный логин или пароль");
      }

      if (data?.user?.role !== "ADMIN") {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        await refresh();
        throw new Error("Access denied");
      }

      await refresh();
      router.push(safeNext);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Неверный логин или пароль";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="Логин"
        className="w-full rounded-xl border border-white/10 bg-black/30 p-3 focus:outline-none focus:ring-2 focus:ring-white/30"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        autoComplete="username"
        required
      />
      <input
        type="password"
        placeholder="Пароль"
        className="w-full rounded-xl border border-white/10 bg-black/30 p-3 focus:outline-none focus:ring-2 focus:ring-white/30"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />

      <button
        className="w-full rounded-xl bg-white text-black font-semibold py-3 hover:bg-white/90 transition disabled:opacity-60"
        type="submit"
        disabled={loading}
      >
        {loading ? "Входим..." : "Войти"}
      </button>

      {error && (
        <div className="space-y-2">
          <p className="text-sm text-red-200 bg-red-500/10 rounded-xl border border-red-500/30 px-3 py-2">
            {error === "Access denied" ? "Access denied" : error}
          </p>
          {error === "Access denied" && (
            <p className="text-xs text-white/60">
              Это страница входа в админку. Для обычного входа используйте{" "}
              <Link href="/login" className="underline underline-offset-4">
                /login
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </form>
  );
}

