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
  replyCount?: number;
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
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<Record<number, boolean>>({});

  const [repliesByRootId, setRepliesByRootId] = useState<
    Record<number, CommentItem[]>
  >({});
  const [repliesVisible, setRepliesVisible] = useState<Record<number, boolean>>(
    {}
  );
  const [repliesLoading, setRepliesLoading] = useState<Record<number, boolean>>(
    {}
  );
  const [repliesError, setRepliesError] = useState<Record<number, string | null>>(
    {}
  );

  useEffect(() => {
    let cancelled = false;
    setComments([]);
    setRepliesByRootId({});
    setRepliesVisible({});
    setRepliesLoading({});
    setRepliesError({});
    setReplyTo(null);
    setReplyText("");
    setText("");

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

  const fetchReplies = async (rootId: number, opts?: { force?: boolean }) => {
    if (repliesLoading[rootId]) return;
    if (!opts?.force && repliesByRootId[rootId]) return;

    try {
      setRepliesLoading((prev) => ({ ...prev, [rootId]: true }));
      setRepliesError((prev) => ({ ...prev, [rootId]: null }));
      const res = await fetch(`/api/photos/comments/${rootId}/replies`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { replies?: CommentItem[] };
      setRepliesByRootId((prev) => ({
        ...prev,
        [rootId]: Array.isArray(data.replies) ? data.replies : [],
      }));
    } catch (error) {
      console.error(error);
      setRepliesError((prev) => ({
        ...prev,
        [rootId]: "Не удалось загрузить ответы",
      }));
    } finally {
      setRepliesLoading((prev) => ({ ...prev, [rootId]: false }));
    }
  };

  const toggleReplies = async (rootId: number) => {
    const nextVisible = !repliesVisible[rootId];
    setRepliesVisible((prev) => ({ ...prev, [rootId]: nextVisible }));
    if (nextVisible) {
      await fetchReplies(rootId);
    }
  };

  const submitReply = async (parentId: number) => {
    const content = replyText.trim();
    if (!content) return;

    await requireUser(async () => {
      try {
        setSubmitting(true);
        const res = await fetch(`/api/photos/comments/${parentId}/replies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text: content }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          alert(data?.error ?? "Не удалось отправить ответ");
          return;
        }
        const data = (await res.json()) as { reply?: CommentItem };
        if (data.reply) {
          setRepliesVisible((prev) => ({ ...prev, [parentId]: true }));
          setRepliesByRootId((prev) => ({
            ...prev,
            [parentId]: prev[parentId]
              ? [...prev[parentId], data.reply as CommentItem]
              : [data.reply as CommentItem],
          }));
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === parentId
                ? {
                    ...comment,
                    replyCount: (comment.replyCount ?? 0) + 1,
                  }
                : comment
            )
          );
        }
        setReplyText("");
        setReplyTo(null);
      } catch (error) {
        console.error(error);
        alert("Не удалось отправить ответ");
      } finally {
        setSubmitting(false);
      }
    });
  };

  const deleteComment = async (id: number) => {
    if (deleteLoading[id]) return;
    try {
      setDeleteLoading((prev) => ({ ...prev, [id]: true }));
      const res = await fetch(`/api/photos/${photoId}/comments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("failed");

      const isRoot = comments.some((comment) => comment.id === id);
      const parentRootId = Object.entries(repliesByRootId).reduce<number | null>(
        (found, [rootId, replies]) => {
          if (found !== null) return found;
          return replies.some((reply) => reply.id === id) ? Number(rootId) : null;
        },
        null
      );

      if (parentRootId !== null) {
        setRepliesByRootId((prev) => ({
          ...prev,
          [parentRootId]: prev[parentRootId].filter((reply) => reply.id !== id),
        }));
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === parentRootId
              ? {
                  ...comment,
                  replyCount: Math.max(0, (comment.replyCount ?? 0) - 1),
                }
              : comment
          )
        );
      }

      if (isRoot) {
        setRepliesByRootId((prev) => {
          if (!prev[id]) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setRepliesVisible((prev) => ({ ...prev, [id]: false }));
        setRepliesError((prev) => ({ ...prev, [id]: null }));
        setRepliesLoading((prev) => ({ ...prev, [id]: false }));
        setComments((prev) => prev.filter((comment) => comment.id !== id));
      }

      if (replyTo === id) {
        setReplyTo(null);
        setReplyText("");
      }
    } catch (error) {
      console.error(error);
      alert("Не удалось удалить комментарий");
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const canDelete = (comment: CommentItem) =>
    !!user &&
    (user.role === "ADMIN" || (comment.user?.id && comment.user.id === user.id));

  const formatDate = (createdAt: string) =>
    new Date(createdAt).toLocaleString("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

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
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>{comment.user?.nickname ?? "Гость"}</span>
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-white/80">{comment.text}</p>

                <div className="mt-3 flex items-center gap-4">
                  {(comment.replyCount ?? 0) > 0 && (
                    <button
                      onClick={() => toggleReplies(comment.id)}
                      className="text-xs text-white/70 hover:text-white transition"
                    >
                      {repliesVisible[comment.id]
                        ? "Скрыть ответы"
                        : `Показать ответы (${comment.replyCount})`}
                    </button>
                  )}

                  <button
                    onClick={() =>
                      requireUser(() => {
                        if (replyTo === comment.id) {
                          setReplyTo(null);
                          setReplyText("");
                        } else {
                          setReplyTo(comment.id);
                          setReplyText("");
                        }
                      })
                    }
                    className={[
                      "text-xs text-white/70 hover:text-white transition",
                      !user ? "cursor-not-allowed opacity-70" : "",
                    ].join(" ")}
                  >
                    Ответить
                  </button>

                  {canDelete(comment) && (
                    <button
                      onClick={() => deleteComment(comment.id)}
                      disabled={deleteLoading[comment.id]}
                      className={[
                        "text-xs text-red-400 hover:text-red-300",
                        deleteLoading[comment.id]
                          ? "opacity-70 cursor-wait"
                          : "",
                      ].join(" ")}
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>

              {repliesVisible[comment.id] && (
                <div className="space-y-2">
                  {repliesLoading[comment.id] && (
                    <p className="ml-6 text-sm text-white/60">
                      Загружаем ответы...
                    </p>
                  )}

                  {!repliesLoading[comment.id] && repliesError[comment.id] && (
                    <div className="ml-6 flex items-center gap-3 text-sm text-white/70">
                      <span>{repliesError[comment.id]}</span>
                      <button
                        onClick={() => fetchReplies(comment.id, { force: true })}
                        className="text-xs underline underline-offset-4 hover:text-white transition"
                      >
                        Повторить
                      </button>
                    </div>
                  )}

                  {!repliesLoading[comment.id] &&
                    !repliesError[comment.id] &&
                    (repliesByRootId[comment.id]?.length ?? 0) === 0 && (
                      <p className="ml-6 text-sm text-white/60">
                        Ответов пока нет.
                      </p>
                    )}

                  {(repliesByRootId[comment.id] ?? []).map((reply) => (
                    <div
                      key={reply.id}
                      className="ml-6 rounded-2xl border border-white/10 bg-white/[0.015] p-4"
                    >
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <span>{reply.user?.nickname ?? "Гость"}</span>
                        <span>{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm text-white/80">{reply.text}</p>

                      {canDelete(reply) && (
                        <div className="mt-3">
                          <button
                            onClick={() => deleteComment(reply.id)}
                            disabled={deleteLoading[reply.id]}
                            className={[
                              "text-xs text-red-400 hover:text-red-300",
                              deleteLoading[reply.id]
                                ? "opacity-70 cursor-wait"
                                : "",
                            ].join(" ")}
                          >
                            Удалить
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {replyTo === comment.id && (
                <div className="ml-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <textarea
                    placeholder="Ответить..."
                    className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                  />
                  <div className="mt-2 flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        setReplyTo(null);
                        setReplyText("");
                      }}
                      className="text-xs text-white/70 hover:text-white transition"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={() => submitReply(comment.id)}
                      disabled={submitting}
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60"
                    >
                      Отправить
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
