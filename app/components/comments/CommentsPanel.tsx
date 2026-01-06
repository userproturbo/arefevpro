"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../providers";
import CommentLikeButton from "./CommentLikeButton";

type CommentUser = { id: number; nickname: string | null } | null;

type CommentItem = {
  id: number;
  text: string;
  parentId: number | null;
  createdAt: string;
  user: CommentUser;
  likeCount: number;
  replyCount: number;
  likedByMe: boolean;
};

type RootComment = CommentItem & { replies: CommentItem[] };

type Props = {
  postSlug: string;
  initialComments?: RootComment[];
  showLoginNotice?: boolean;
};

export default function CommentsPanel({
  postSlug,
  initialComments,
  showLoginNotice = true,
}: Props) {
  const { user, requireUser } = useAuth();
  const [comments, setComments] = useState<RootComment[]>(initialComments || []);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!initialComments || initialComments.length === 0) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postSlug]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/posts/${postSlug}/comments`, {
        credentials: "include",
      });
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
    const content = text.trim();
    if (!content) return;

    await requireUser(async () => {
      try {
        setSubmitting(true);
        const res = await fetch(`/api/posts/${postSlug}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text: content }),
        });
        if (!res.ok) throw new Error("failed");
        const data = await res.json();

        setComments((prev) => [
          { ...data.comment, replies: [] } as RootComment,
          ...prev,
        ]);
        setText("");
      } catch (error) {
        console.error(error);
        alert("Не удалось отправить комментарий");
      } finally {
        setSubmitting(false);
      }
    });
  };

  const submitReply = async (parentId: number) => {
    const content = replyText.trim();
    if (!content) return;

    await requireUser(async () => {
      try {
        setSubmitting(true);
        const res = await fetch(`/api/posts/${postSlug}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text: content, parentId }),
        });
        if (!res.ok) throw new Error("failed");
        const data = await res.json();

        setComments((prev) =>
          prev.map((root) =>
            root.id === parentId
              ? {
                  ...root,
                  replies: [...root.replies, data.comment],
                  replyCount: root.replyCount + 1,
                }
              : root
          )
        );

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
      const res = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("failed");
      setComments((prev) =>
        prev
          .filter((root) => root.id !== id)
          .map((root) => {
            const nextReplies = root.replies.filter((reply) => reply.id !== id);
            const removed = root.replies.length - nextReplies.length;
            if (removed === 0) return { ...root, replies: nextReplies };
            return {
              ...root,
              replies: nextReplies,
              replyCount: Math.max(0, root.replyCount - removed),
            };
          })
      );
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
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              onClick={submitComment}
              disabled={submitting}
              className="mt-2 rounded-full bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 disabled:opacity-60"
            >
              Отправить
            </button>
          </div>
        </div>
      ) : showLoginNotice ? (
        <p className="text-white/70 text-sm">
          Чтобы ставить лайки и писать комментарии,{" "}
          <Link href="/login" className="underline underline-offset-4">
            войдите
          </Link>
          {" или "}
          <Link href="/register" className="underline underline-offset-4">
            зарегистрируйтесь
          </Link>
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
          <div key={comment.id} className="space-y-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between text-xs text-white/60">
                <div className="font-semibold text-white">
                  {comment.user?.nickname || "Без имени"}
                </div>
                <span>{formatDate(comment.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm text-white/90 whitespace-pre-wrap">
                {comment.text}
              </p>

              <div className="mt-3 flex items-center justify-between gap-3">
                <CommentLikeButton
                  commentId={comment.id}
                  initialLiked={comment.likedByMe}
                  initialCount={comment.likeCount}
                />

                <div className="flex items-center gap-4">
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
                        deleteLoading[comment.id] ? "opacity-70 cursor-wait" : "",
                      ].join(" ")}
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            </div>

            {replyTo === comment.id && (
              <div className="ml-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <textarea
                  placeholder="Ответить..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
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
                    className="rounded-full bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 disabled:opacity-60"
                  >
                    Отправить
                  </button>
                </div>
              </div>
            )}

            {comment.replies.length > 0 && (
              <div className="space-y-2">
                {comment.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="ml-6 rounded-2xl border border-white/10 bg-white/[0.015] p-4"
                  >
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <div className="font-semibold text-white">
                        {reply.user?.nickname || "Без имени"}
                      </div>
                      <span>{formatDate(reply.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm text-white/90 whitespace-pre-wrap">
                      {reply.text}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <CommentLikeButton
                        commentId={reply.id}
                        initialLiked={reply.likedByMe}
                        initialCount={reply.likeCount}
                      />

                      {canDelete(reply) && (
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
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
