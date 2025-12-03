import type { ReactNode } from "react";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#04050a] text-white">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <header className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Админка</p>
            <h1 className="text-4xl font-bold leading-tight">Управление CRAZYLIFE</h1>
            <p className="text-white/60">
              Создавай и редактируй разделы: обо мне, фото, видео, музыка и блог.
            </p>
          </div>
          <LogoutButton />
        </header>
        {children}
      </div>
    </div>
  );
}
