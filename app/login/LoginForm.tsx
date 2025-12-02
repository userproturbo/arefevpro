"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Неверный логин или пароль");
      }

      router.push(next || "/admin");
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
        <p className="text-sm text-red-200 bg-red-500/10 rounded-xl border border-red-500/30 px-3 py-2">
          {error}
        </p>
      )}
    </form>
  );
}
