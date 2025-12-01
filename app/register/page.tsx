"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Ошибка регистрации");
      return;
    }

    router.push("/login");
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
          placeholder="Ваше имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="p-3 rounded bg-zinc-800"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="p-3 rounded bg-zinc-800"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="p-3 rounded bg-purple-600 hover:bg-purple-700 transition"
        >
          Зарегистрироваться
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
