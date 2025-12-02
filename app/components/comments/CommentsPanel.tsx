"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../providers";

type Comment = {
  id: number;
  text: string;
  createdAt: string;
  user: { id: number; nickname: string } | null;
};

type Props = {
  postSlug: string;
  initialComments?: Comment[];
  showLoginNotice?: boolean;
};

export default function CommentsPanel({
  postSlug,
  initialComments,
  showLoginNotice = true,
}: Props) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!initialComments || initialComments.length === 0) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postSlug]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/posts/${postSlug}/comments`);
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setComments(data.comments ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async () => {
    if (!text.trim() || !user) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/posts/${postSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setComments((prev) => [data.comment, ...prev]);
      setText("");
    } catch (error) {
      console.error(error);
      alert("Не удалось отправить комментарий");
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id: number) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("failed");
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error(error);
      alert("Не удалось удалить комментарий");
    }
  };

  return (
    <div className="space-y-4">
      {user ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <textarea
            placeholder="Добавить комментарий..."
            className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              onClick={submitComment}
              disabled={loading}
              className="mt-2 rounded-full bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 disabled:opacity-60"
            >
              Отправить
            </button>
          </div>
        </div>
      ) : showLoginNotice ? (
        <p className="text-white/70 text-sm">
          Чтобы ставить лайки и писать комментарии,{" "}
          <a href="/login" className="underline underline-offset-4">
            войдите
          </a>
          .
        </p>
      ) : null}

      <div className="space-y-3">
        {loading && comments.length === 0 && (
          <p className="text-white/60 text-sm">Загружаем комментарии...</p>
        )}
        {comments.length === 0 && !loading && (
          <p className="text-white/60 text-sm">Комментариев пока нет.</p>
        )}

        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
          >
            <div className="flex items-center justify-between text-xs text-white/60">
              <div className="font-semibold text-white">
                {comment.user?.nickname || "Без имени"}
              </div>
              <span>
                {new Date(comment.createdAt).toLocaleString("ru-RU", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/90 whitespace-pre-wrap">
              {comment.text}
            </p>
            {user?.role === "ADMIN" && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Удалить
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
