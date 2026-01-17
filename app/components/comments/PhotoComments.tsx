"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/providers";

type CommentUser = { id: number; nickname: string | null } | null;

type CommentItem = {
  id: number;
  text: string;
  createdAt: string;
  user: CommentUser;
};

type Props = {
  photoId: number;
};

export default function PhotoComments({ photoId }: Props) {
  const { user, requireUser } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">(
    "idle"
  );
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const res = await fetch(`/api/photos/${photoId}/comments`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { comments?: CommentItem[] };
        const nextComments = Array.isArray(data.comments) ? data.comments : [];
        if (!cancelled) {
          setComments(nextComments);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [photoId]);

  const submitComment = async () => {
    const content = text.trim();
    if (!content) return;

    await requireUser(async () => {
      try {
        setSubmitting(true);
        const res = await fetch(`/api/photos/${photoId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text: content }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          alert(data?.error ?? "Не удалось отправить комментарий");
          return;
        }
        const data = (await res.json()) as { comment?: CommentItem };
        if (data.comment) {
          setComments((prev) => [data.comment as CommentItem, ...prev]);
        }
        setText("");
      } catch (error) {
        console.error(error);
        alert("Не удалось отправить комментарий");
      } finally {
        setSubmitting(false);
      }
    });
  };

  return (
    <div className="space-y-4">
      {user ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <textarea
            placeholder="Добавить комментарий..."
            className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={submitComment}
              disabled={submitting}
              className="mt-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60"
            >
              Отправить
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
          <Link href="/login" className="text-white underline underline-offset-4">
            Войдите
          </Link>{" "}
          чтобы оставить комментарий.
        </div>
      )}

      {status === "loading" || status === "idle" ? (
        <div className="space-y-2">
          <div className="h-14 rounded-xl bg-white/[0.06]" />
          <div className="h-14 rounded-xl bg-white/[0.06]" />
          <div className="h-14 rounded-xl bg-white/[0.06]" />
        </div>
      ) : null}

      {status === "error" ? (
        <p className="text-sm text-white/60">Не удалось загрузить комментарии.</p>
      ) : null}

      {status === "ready" && comments.length === 0 ? (
        <p className="text-sm text-white/60">Комментариев пока нет.</p>
      ) : null}

      {status === "ready" && comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-3"
            >
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>{comment.user?.nickname ?? "Гость"}</span>
                <span>
                  {new Date(comment.createdAt).toLocaleString("ru-RU", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="mt-2 text-sm text-white/80">{comment.text}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
