"use client";
import { useState } from "react";
import Link from "next/link";

export default function SecretAdmin() {
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [unlocked, setUnlocked] = useState(false);

    function checkPassword() {
        if (password === "crazylife777") {
            setUnlocked(true);
        }
        setPassword("");
        setOpen(false);
    }

    return (
        <>
            {/* Маленькая точка в углу */}
            {!unlocked && (
                <div
                    onClick={() => setOpen(true)}
                    className="fixed top-4 right-4 w-3 h-3 rounded-full bg-gray-500 cursor-pointer hover:bg-white transition"
                />
            )}

            {/* Поле ввода пароля */}
            {open && !unlocked && (
                <div className="fixed top-4 right-4 bg-black border border-gray-700 p-3 rounded-lg shadow-lg">
                    <input
                        type="password"
                        className="bg-gray-900 border border-gray-700 p-1 rounded mr-2"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        onClick={checkPassword}
                        className="bg-gray-800 px-2 py-1 rounded hover:bg-gray-700"
                    >
                        OK
                    </button>
                </div>
            )}

            {/* Админ-меню */}
            {unlocked && (
                <div className="fixed top-4 right-4 flex gap-4 bg-black border border-gray-700 p-3 rounded-lg shadow-lg text-sm">
                    <Link href="/" className="hover:text-gray-300">
                        Главная
                    </Link>
                    <Link href="/create" className="hover:text-gray-300">
                        Создать
                    </Link>
                    <Link href="/profile" className="hover:text-gray-300">
                        Профиль
                    </Link>
                    <Link href="/admin/login" className="hover:text-gray-300">
                        Войти
                    </Link>
                </div>
            )}
        </>
    );
}
