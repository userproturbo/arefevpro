"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [nickname, setNickname] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, login, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Ошибка регистрации");
      setLoading(false);
      return;
    }

    const next = searchParams.get("next");
    router.push(next || "/");
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md p-8 bg-zinc-900 rounded-xl shadow-xl flex flex-col gap-4"
      >
        <h1 className="text-3xl font-bold text-center mb-4">Регистрация</h1>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <input
          className="p-3 rounded bg-zinc-800"
          placeholder="Никнейм"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        <input
          className="p-3 rounded bg-zinc-800"
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          autoComplete="username"
        />

        <input
          className="p-3 rounded bg-zinc-800"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="p-3 rounded bg-purple-600 hover:bg-purple-700 transition disabled:opacity-60"
        >
          {loading ? "Регистрируем..." : "Зарегистрироваться"}
        </button>

        <p className="text-sm text-center text-zinc-400">
          Уже есть аккаунт?{" "}
          <a href="/login" className="text-purple-400 hover:underline">
            Войти
          </a>
        </p>
      </form>
    </div>
  );
}
