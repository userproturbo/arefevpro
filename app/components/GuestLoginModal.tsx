"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (nickname: string) => Promise<void> | void;
  loading?: boolean;
};

function generateNickname() {
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `Гость-${random}`;
}

export default function GuestLoginModal({ open, onClose, onSubmit, loading }: Props) {
  const fallbackName = useMemo(() => generateNickname(), []);
  const [nickname, setNickname] = useState(fallbackName);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNickname(generateNickname());
    }
  }, [open]);

  const handleSubmit = async () => {
    const name = nickname.trim() || fallbackName;
    await onSubmit(name);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-sm rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Быстрый вход</h3>
              <button
                className="text-sm text-white/60 hover:text-white"
                onClick={onClose}
              >
                Закрыть
              </button>
            </div>

            <p className="text-sm text-white/60 mb-3">
              Чтобы поставить лайк или оставить комментарий, укажи никнейм.
              Мы создадим гостевой профиль и включим тебе все функции.
            </p>

            <div className="space-y-3">
              <label className="text-sm text-white/70">Имя / никнейм</label>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/5 p-3 focus:outline-none focus:ring-2 focus:ring-white/40"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Гость-1234"
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-lg bg-white text-black font-semibold py-2 hover:bg-white/90 transition disabled:opacity-60"
              >
                {loading ? "Вход..." : "Продолжить"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
