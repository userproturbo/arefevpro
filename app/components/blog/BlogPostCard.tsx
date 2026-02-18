import Link from "next/link";
import { getPostCover, getPostExcerpt, getPostTitle } from "@/lib/postPreview";

type BlogPostCardPost = {
  id: number;
  slug: string;
  title: string;
  text: string | null;
  content: unknown;
  coverImage: string | null;
  createdAt: Date;
};

type Props = {
  post: BlogPostCardPost;
  featured?: boolean;
};

export default function BlogPostCard({ post, featured = false }: Props) {
  const title = getPostTitle(post);
  const excerpt = getPostExcerpt(post, featured ? 220 : 160);
  const cover = getPostCover(post);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group relative block overflow-hidden rounded-3xl border border-white/10 bg-[#070b11] transition hover:border-white/25 ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      <div className={`relative overflow-hidden ${featured ? "h-[26rem]" : "h-72"}`}>
        {cover.kind === "image" ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${cover.src})` }}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${cover.gradientClass}`} />
        )}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_45%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
          <div className="mb-3 text-[11px] uppercase tracking-[0.16em] text-white/60">
            {new Date(post.createdAt).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>

          <h2 className={`font-semibold leading-tight text-white ${featured ? "text-3xl sm:text-4xl" : "text-2xl"}`}>
            {title}
          </h2>

          {excerpt ? (
            <p className={`mt-3 max-w-2xl text-white/75 ${featured ? "text-base leading-7" : "text-sm leading-6"}`}>
              {excerpt}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
