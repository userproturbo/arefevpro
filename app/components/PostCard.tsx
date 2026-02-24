"use client";

import { UiPost } from "../types";
import Link from "next/link";
import LikeButton from "./buttons/LikeButton";
import { motion, type HTMLMotionProps } from "framer-motion";
import { getPostCover, getPostExcerpt, getPostTitle } from "@/lib/postPreview";

type Props = {
  post: UiPost;
} & Omit<HTMLMotionProps<"div">, "children">;

function getBadge(type: UiPost["type"]) {
  switch (type) {
    case "PHOTO":
      return "Фото";
    case "VIDEO":
      return "Видео";
    case "MUSIC":
      return "Музыка";
    case "BLOG":
      return null;
    case "ABOUT":
      return "Обо мне";
    default:
      return "Контент";
  }
}

export default function PostCard({ post, className, ...divProps }: Props) {
  const title = getPostTitle(post);
  const excerpt = getPostExcerpt(post);
  const cover = getPostCover(post);
  const badge = getBadge(post.type);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur${
        className ? ` ${className}` : ""
      }`}
      {...divProps}
    >
      <Link href={`/post/${post.slug}`} className="block">
        <div className="relative h-56 overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 transition duration-500 group-hover:scale-105"
            style={
              cover.kind === "image"
                ? {
                    backgroundImage: `url(${cover.src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          />
          {cover.kind === "fallback" ? (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${cover.gradientClass}`}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          {badge ? (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 border border-white/15 text-xs uppercase tracking-[0.12em]">
              {badge}
            </div>
          ) : null}
        </div>
      </Link>

      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              href={`/post/${post.slug}`}
              className="text-lg font-semibold leading-tight hover:text-white"
            >
              {title}
            </Link>
            {excerpt && (
              <p className="mt-2 text-sm text-white/60 line-clamp-2">
                {excerpt}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-white/50">
          <span>
            {new Date(post.createdAt).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "short",
            })}
          </span>
          <LikeButton
            postSlug={post.slug}
            initialCount={post.likesCount}
            initialLiked={post.liked}
            size="sm"
          />
        </div>
      </div>
    </motion.div>
  );
}
