export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import PageContainer from "@/app/components/PageContainer";
import PhotoLikeButton from "@/app/components/photo/PhotoLikeButton";
import PhotoComments from "@/app/components/photo/PhotoComments";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  getDatabaseUnavailableMessage,
  isDatabaseUnavailableError,
  isExpectedDevDatabaseError,
} from "@/lib/db";
import { notFound } from "next/navigation";

export default async function PhotoDetailPage({
  params,
}: {
  params: Promise<{ slug: string; photoId: string }>;
}) {
  const { slug, photoId } = await params;
  const normalizedSlug = slug.trim();
  const numericPhotoId = Number(photoId);
  if (!normalizedSlug || !Number.isFinite(numericPhotoId)) {
    notFound();
  }

  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  let photo:
    | {
        id: number;
        url: string;
        width: number | null;
        height: number | null;
        album: { title: string; slug: string };
        _count: { likes: number; comments: number };
      }
    | null = null;

  try {
    photo = await prisma.photo.findFirst({
      where: {
        id: numericPhotoId,
        deletedAt: null,
        album: { slug: normalizedSlug, published: true, deletedAt: null },
      },
      select: {
        id: true,
        url: true,
        width: true,
        height: true,
        album: { select: { title: true, slug: true } },
        _count: {
          select: {
            likes: true,
            comments: isAdmin ? true : { where: { deletedAt: null } },
          },
        },
      },
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      if (!isExpectedDevDatabaseError(error)) {
        console.error("Photo detail error:", error);
      }
      return (
        <PageContainer>
          <h1 className="text-2xl font-semibold">
            {getDatabaseUnavailableMessage()}
          </h1>
        </PageContainer>
      );
    }
    console.error("Photo detail error:", error);
    return (
      <PageContainer>
        <h1 className="text-2xl font-semibold">Ошибка загрузки фото</h1>
      </PageContainer>
    );
  }

  if (!photo) {
    notFound();
  }

  const COMMENTS_LIMIT = 10;
  const whereRoot = {
    photoId: photo.id,
    parentId: null,
    ...(isAdmin ? {} : { deletedAt: null }),
  };
  const repliesCountSelect = isAdmin ? true : { where: { deletedAt: null } };

  const [totalRootComments, rootComments] = await Promise.all([
    prisma.photoComment.count({ where: whereRoot }),
    prisma.photoComment.findMany({
      where: whereRoot,
      orderBy: { createdAt: "desc" },
      take: COMMENTS_LIMIT,
      select: {
        id: true,
        text: true,
        parentId: true,
        createdAt: true,
        deletedAt: true,
        user: { select: { id: true, nickname: true } },
        _count: {
          select: {
            likes: true,
            replies: repliesCountSelect,
          },
        },
      },
    }),
  ]);

  const liked = user
    ? !!(await prisma.photoLike.findUnique({
        where: { photoId_userId: { photoId: photo.id, userId: user.id } },
      }))
    : false;

  let likedByMeSet = new Set<number>();
  if (user) {
    const rootCommentIds = rootComments.map((comment) => comment.id);
    if (rootCommentIds.length > 0) {
      const likedComments = await prisma.photoCommentLike.findMany({
        where: { userId: user.id, commentId: { in: rootCommentIds } },
        select: { commentId: true },
      });
      likedByMeSet = new Set(likedComments.map((row) => row.commentId));
    }
  }

  const comments = rootComments.map((comment) => ({
    id: comment.id,
    text: comment.text,
    parentId: comment.parentId,
    createdAt: comment.createdAt.toISOString(),
    deletedAt: comment.deletedAt ? comment.deletedAt.toISOString() : null,
    user: comment.user,
    likeCount: comment._count.likes,
    replyCount: comment._count.replies,
    likedByMe: user ? likedByMeSet.has(comment.id) : false,
  }));

  const totalPages = Math.ceil(totalRootComments / COMMENTS_LIMIT);
  const initialPagination = {
    page: 1,
    limit: COMMENTS_LIMIT,
    totalRootComments,
    totalPages,
    hasNextPage: 1 < totalPages,
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="space-y-2">
          <Link
            href={`/photo/${photo.album.slug}`}
            className="text-sm text-white/70 hover:text-white transition"
          >
            ← {photo.album.title}
          </Link>
          <h1 className="text-2xl font-semibold">Фото</h1>
        </div>

        <div className="space-y-3">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt=""
              className="w-full max-h-[70vh] object-contain bg-black/30"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <PhotoLikeButton
              photoId={photo.id}
              initialCount={photo._count.likes}
              initialLiked={liked}
            />
            <span className="text-sm text-white/70">
              {photo._count.comments} комментариев
            </span>
            {photo.width && photo.height ? (
              <span className="text-xs text-white/60">
                {photo.width} × {photo.height}
              </span>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Комментарии</h2>
          <PhotoComments
            photoId={photo.id}
            initialComments={comments}
            initialPagination={initialPagination}
          />
        </div>
      </div>
    </PageContainer>
  );
}
