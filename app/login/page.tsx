"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      window.location.href = "/create";
    } else {
      alert("Неверный email или пароль");
    }
  }

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <h1 className="text-xl font-bold">Вход</h1>

      <form className="space-y-4" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 bg-gray-900 border border-gray-700"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          className="w-full p-2 bg-gray-900 border border-gray-700"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-white text-black p-2 font-semibold">
          Войти
        </button>
      </form>
    </div>
  );
}
