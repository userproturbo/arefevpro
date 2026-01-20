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
  deletedAt: string | null;
  user: CommentUser;
  likeCount: number;
  replyCount: number;
  likedByMe: boolean;
};

type CommentEntity = "post" | "photo" | "video";

type Pagination = {
  page: number;
  limit: number;
  totalRootComments: number;
  totalPages: number;
  hasNextPage: boolean;
};

type Props = {
  entity: CommentEntity;
  entityId: string | number;
  initialComments?: CommentItem[];
  initialPagination?: Pagination;
  showLoginNotice?: boolean;
};

const entityPluralByType: Record<CommentEntity, string> = {
  post: "posts",
  photo: "photos",
  video: "videos",
};

const buildCommentPaths = (entity: CommentEntity, entityId: string | number) => {
  const entityPlural = entityPluralByType[entity];
  const encodedId = encodeURIComponent(String(entityId));
  return {
    listUrl: `/api/${entityPlural}/${encodedId}/comments`,
    repliesUrl: (commentId: number) =>
      `/api/${entityPlural}/comments/${commentId}/replies`,
    deleteUrl: (commentId: number) =>
      `/api/${entityPlural}/${encodedId}/comments/${commentId}`,
    likeUrl: (commentId: number) =>
      `/api/${entityPlural}/comments/${commentId}/like`,
    enableLikes: entity !== "photo",
  };
};

const normalizeComment = (comment: CommentItem & { content?: string }) => ({
  ...comment,
  text: comment.text ?? comment.content ?? "",
  parentId: comment.parentId ?? null,
  deletedAt: comment.deletedAt ?? null,
  likeCount: typeof comment.likeCount === "number" ? comment.likeCount : 0,
  replyCount: typeof comment.replyCount === "number" ? comment.replyCount : 0,
  likedByMe: typeof comment.likedByMe === "boolean" ? comment.likedByMe : false,
});

export default function CommentsPanel({
  entity,
  entityId,
  initialComments,
  initialPagination,
  showLoginNotice = true,
}: Props) {
  const { user, requireUser } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>(
    (initialComments ?? []).map(normalizeComment)
  );
  const [pagination, setPagination] = useState<Pagination | null>(
    initialPagination || null
  );
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState("");
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
  const paths = buildCommentPaths(entity, entityId);

  useEffect(() => {
    setComments((initialComments ?? []).map(normalizeComment));
    setPagination(initialPagination || null);
    setRepliesByRootId({});
    setRepliesVisible({});
    setRepliesLoading({});
    setRepliesError({});
    setReplyTo(null);
    setReplyText("");
    setText("");

    if (
      !initialComments ||
      initialComments.length === 0 ||
      !initialPagination
    ) {
      fetchRootComments({ page: 1, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, entityId]);

  const readErrorMessage = async (res: Response, fallback: string) => {
    try {
      const data = await res.json();
      if (data && typeof data === "object") {
        const error = (data as { error?: unknown }).error;
        if (typeof error === "string") return error;
      }
    } catch (error) {
      console.error(error);
    }
    return fallback;
  };

  const fetchRootComments = async ({
    page,
    replace,
  }: {
    page: number;
    replace: boolean;
  }) => {
    try {
      if (replace) setLoading(true);
      else setLoadingMore(true);

      const limit =
        pagination?.limit || initialPagination?.limit || 10;
      const res = await fetch(
        `${paths.listUrl}?page=${page}&limit=${limit}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      const nextComments = (data.comments ?? []) as CommentItem[];
      const nextPagination = (data.pagination ?? null) as Pagination | null;

      setComments((prev) =>
        replace
          ? nextComments.map(normalizeComment)
          : [...prev, ...nextComments.map(normalizeComment)]
      );
      setPagination(nextPagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = async () => {
    if (!pagination?.hasNextPage || loadingMore) return;
    await fetchRootComments({ page: pagination.page + 1, replace: false });
  };

  const fetchReplies = async (
    rootCommentId: number,
    opts?: { force?: boolean }
  ) => {
    const force = !!opts?.force;
    if (!force && repliesByRootId[rootCommentId]) return;
    if (repliesLoading[rootCommentId]) return;

    try {
      setRepliesLoading((prev) => ({ ...prev, [rootCommentId]: true }));
      setRepliesError((prev) => ({ ...prev, [rootCommentId]: null }));

      const res = await fetch(paths.repliesUrl(rootCommentId), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setRepliesByRootId((prev) => ({
        ...prev,
        [rootCommentId]: ((data.replies ?? []) as CommentItem[]).map(
          normalizeComment
        ),
      }));
    } catch (error) {
      console.error(error);
      setRepliesError((prev) => ({
        ...prev,
        [rootCommentId]: "Не удалось загрузить ответы",
      }));
    } finally {
      setRepliesLoading((prev) => ({ ...prev, [rootCommentId]: false }));
    }
  };

  const toggleReplies = async (rootCommentId: number) => {
    const nextVisible = !repliesVisible[rootCommentId];
    setRepliesVisible((prev) => ({ ...prev, [rootCommentId]: nextVisible }));
    if (nextVisible) {
      await fetchReplies(rootCommentId);
    }
  };

  const submitComment = async () => {
    const content = text.trim();
    if (!content) return;

    await requireUser(async () => {
      try {
        setSubmitting(true);
        const res = await fetch(paths.listUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text: content, content }),
        });
        if (!res.ok) {
          const message = await readErrorMessage(
            res,
            "Не удалось отправить комментарий"
          );
          alert(message);
          return;
        }
        const data = await res.json();

        const comment = (data.comment ?? data.reply) as CommentItem | undefined;
        if (!comment) return;
        const normalizedComment = normalizeComment(comment);
        setComments((prev) => [normalizedComment, ...prev]);
        setPagination((prev) => {
          if (!prev) return prev;
          const totalRootComments = prev.totalRootComments + 1;
          const totalPages = Math.ceil(totalRootComments / prev.limit);
          return {
            ...prev,
            totalRootComments,
            totalPages,
            hasNextPage: prev.page < totalPages,
          };
        });
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
        const res = await fetch(paths.repliesUrl(parentId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text: content, content }),
        });
        if (!res.ok) {
          const message = await readErrorMessage(
            res,
            "Не удалось отправить ответ"
          );
          alert(message);
          return;
        }
        const data = await res.json();
        const reply = (data.reply ?? data.comment) as CommentItem | undefined;
        if (!reply) return;
        const normalizedReply = normalizeComment(reply);

        setComments((prev) =>
          prev.map((root) =>
            root.id === parentId
              ? {
                  ...root,
                  replyCount: root.replyCount + 1,
                }
              : root
          )
        );

        setRepliesVisible((prev) => ({ ...prev, [parentId]: true }));
        setRepliesByRootId((prev) =>
          prev[parentId]
            ? { ...prev, [parentId]: [...prev[parentId], normalizedReply] }
            : prev
        );
        if (!repliesByRootId[parentId]) {
          void fetchReplies(parentId, { force: true });
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
      const res = await fetch(paths.deleteUrl(id), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("failed");

      const isAdmin = user?.role === "ADMIN";
      if (isAdmin) {
        const deletedAt = new Date().toISOString();
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === id ? { ...comment, deletedAt } : comment
          )
        );
        setRepliesByRootId((prev) => {
          let changed = false;
          const next = Object.fromEntries(
            Object.entries(prev).map(([rootId, replies]) => {
              const updatedReplies = replies.map((reply) => {
                if (reply.id !== id) return reply;
                changed = true;
                return { ...reply, deletedAt };
              });
              return [rootId, updatedReplies];
            })
          ) as Record<number, CommentItem[]>;
          return changed ? next : prev;
        });
        setReplyTo((prev) => (prev === id ? null : prev));
        if (replyTo === id) {
          setReplyText("");
        }
        return;
      }

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
      }

      setComments((prev) =>
        prev
          .filter((root) => root.id !== id)
          .map((root) =>
            parentRootId !== null && root.id === parentRootId
              ? { ...root, replyCount: Math.max(0, root.replyCount - 1) }
              : root
          )
      );

      setPagination((prev) => {
        if (!prev) return prev;
        if (!isRoot) return prev;
        const totalRootComments = Math.max(0, prev.totalRootComments - 1);
        const totalPages = Math.ceil(totalRootComments / prev.limit);
        return {
          ...prev,
          totalRootComments,
          totalPages,
          hasNextPage: prev.page < totalPages,
        };
      });
    } catch (error) {
      console.error(error);
      alert("Не удалось удалить комментарий");
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const canDelete = (comment: CommentItem) =>
    !!user &&
    !comment.deletedAt &&
    (user.role === "ADMIN" || (comment.user?.id && comment.user.id === user.id));

  const formatDate = (createdAt: string) =>
    new Date(createdAt).toLocaleString("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  const isDeleted = (comment: CommentItem) => !!comment.deletedAt;

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
          <div key={comment.id} id={`comment-${comment.id}`} className="space-y-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between text-xs text-white/60">
                <div className="font-semibold text-white">
                  {!isDeleted(comment)
                    ? comment.user?.nickname || "Без имени"
                    : null}
                </div>
                <span>{formatDate(comment.createdAt)}</span>
              </div>
              <p
                className={[
                  "mt-2 whitespace-pre-wrap",
                  isDeleted(comment)
                    ? "text-xs text-white/50"
                    : "text-sm text-white/90",
                ].join(" ")}
              >
                {isDeleted(comment) ? "Комментарий удалён" : comment.text}
              </p>

              <div className="mt-3 flex items-center justify-between gap-3">
                {!isDeleted(comment) && paths.enableLikes && (
                  <CommentLikeButton
                    commentId={comment.id}
                    initialLiked={comment.likedByMe}
                    initialCount={comment.likeCount}
                    endpoint={paths.likeUrl(comment.id)}
                  />
                )}

                <div className="flex items-center gap-4">
                  {comment.replyCount > 0 && (
                    <button
                      onClick={() => toggleReplies(comment.id)}
                      className="text-xs text-white/70 hover:text-white transition"
                    >
                      {repliesVisible[comment.id]
                        ? "Скрыть ответы"
                        : `Показать ответы (${comment.replyCount})`}
                    </button>
                  )}

                  {!isDeleted(comment) && (
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
                  )}

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

            {repliesVisible[comment.id] && (
              <div className="space-y-2">
                {repliesLoading[comment.id] && (
                  <p className="ml-6 text-white/60 text-sm">Загружаем ответы...</p>
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
                    <p className="ml-6 text-white/60 text-sm">Ответов пока нет.</p>
                  )}

                {(repliesByRootId[comment.id] ?? []).map((reply) => (
                  <div
                    key={reply.id}
                    id={`comment-${reply.id}`}
                    className="ml-6 rounded-2xl border border-white/10 bg-white/[0.015] p-4"
                  >
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <div className="font-semibold text-white">
                        {!isDeleted(reply) ? reply.user?.nickname || "Без имени" : null}
                      </div>
                      <span>{formatDate(reply.createdAt)}</span>
                    </div>
                    <p
                      className={[
                        "mt-2 whitespace-pre-wrap",
                        isDeleted(reply)
                          ? "text-xs text-white/50"
                          : "text-sm text-white/90",
                      ].join(" ")}
                    >
                      {isDeleted(reply) ? "Комментарий удалён" : reply.text}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      {!isDeleted(reply) && paths.enableLikes && (
                        <CommentLikeButton
                          commentId={reply.id}
                          initialLiked={reply.likedByMe}
                          initialCount={reply.likeCount}
                          endpoint={paths.likeUrl(reply.id)}
                        />
                      )}

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
          </div>
        ))}
      </div>

      {pagination?.hasNextPage && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.06] disabled:opacity-60"
          >
            {loadingMore ? "Загружаем..." : "Загрузить ещё комментарии"}
          </button>
        </div>
      )}
    </div>
  );
}
