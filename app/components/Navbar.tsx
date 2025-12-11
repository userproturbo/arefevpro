"use client";

import { useNavigation } from "@/store/navigationStore";

export default function Navbar() {
  const open = useNavigation((state) => state.open);

  return (
    <nav className="fixed right-4 top-4 z-40">
      <button
        type="button"
        className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
        onClick={open}
      >
        Menu
      </button>
    </nav>
  );
}
