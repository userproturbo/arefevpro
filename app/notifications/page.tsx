"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "../providers";

type NotificationData = {
  postSlug?: string;
  commentId?: number;
  replyId?: number;
  albumSlug?: string;
  photoId?: number;
};

type NotificationItem = {
  id: string;
  type: "COMMENT_REPLY";
  data: NotificationData;
  readAt: string | null;
  createdAt: string;
};

type NotificationsResponse = {
  unreadCount: number;
  notifications: NotificationItem[];
};

export default function NotificationsPage() {
  const { user, loading: authLoading, requireUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as NotificationsResponse;
      setItems(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      void requireUser();
      return;
    }
    void fetchNotifications();
  }, [authLoading, requireUser, user]);

  const markAsRead = async (id: string) => {
    if (markingId === id) return;
    const target = items.find((item) => item.id === id);
    if (!target || target.readAt) return;
    setMarkingId(id);
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("failed");
      const readAt = new Date().toISOString();
      setItems((prev) =>
        prev.map((item) =>
          item.id === id && !item.readAt ? { ...item, readAt } : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    } finally {
      setMarkingId(null);
    }
  };

  const emptyState = useMemo(() => !loading && items.length === 0, [loading, items]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-white/60">
          {unreadCount > 0
            ? `${unreadCount} unread`
            : "All caught up"}
        </p>
      </header>

      {loading && (
        <p className="text-sm text-white/60">Loading notifications...</p>
      )}

      {emptyState && (
        <p className="text-sm text-white/60">No notifications yet.</p>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const commentId = item.data?.commentId;
          const postSlug = item.data?.postSlug;
          const albumSlug = item.data?.albumSlug;
          const photoId = item.data?.photoId;
          const anchorId = item.data?.replyId ?? commentId ?? undefined;
          const href =
            item.type === "COMMENT_REPLY" && postSlug && commentId
              ? `/blog/${postSlug}#comment-${commentId}`
              : item.type === "COMMENT_REPLY" && albumSlug && photoId
                ? `/photo/${albumSlug}/${photoId}${anchorId ? `#comment-${anchorId}` : ""}`
                : "/blog";
          const createdAt = new Date(item.createdAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          const isUnread = !item.readAt;
          const message = "Someone replied to your comment";

          return (
            <Link
              key={item.id}
              href={href}
              onClick={() => void markAsRead(item.id)}
              className={[
                "block rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:bg-white/[0.05]",
                isUnread ? "border-white/20" : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-white/90">{message}</p>
                  <p className="text-xs text-white/50">{createdAt}</p>
                </div>
                {isUnread && (
                  <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[0.65rem] font-semibold text-black">
                    New
                  </span>
                )}
              </div>
              {markingId === item.id && (
                <p className="mt-2 text-xs text-white/40">Marking as read...</p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
