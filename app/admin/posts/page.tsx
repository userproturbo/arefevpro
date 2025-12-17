import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminType, getTypeLabel } from "@/lib/adminPostTypes";
import { prisma } from "@/lib/prisma";
import DeletePostButton from "./DeletePostButton";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const typeParam = Array.isArray(params?.type) ? params.type[0] : params?.type;
  const requestedPath = `/admin/posts${typeParam ? `?type=${typeParam}` : ""}`;

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect(`/login?next=${encodeURIComponent(requestedPath)}`);
  }

  const config = getAdminType(typeParam);

  if (!config) {
    redirect("/admin");
  }

  const posts = await prisma.post.findMany({
    where: { type: config.postType },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      createdAt: true,
      isPublished: true,
    },
  });

  return (
    <main className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-white/60">
            {getTypeLabel(config.key)}
          </p>
          <h1 className="text-2xl font-bold">Посты раздела</h1>
        </div>
        <Link
          href={`/admin/posts/new?type=${config.key}`}
          className="inline-flex items-center gap-2 rounded-lg bg-white text-black px-4 py-2 font-semibold hover:bg-white/90"
        >
          Создать пост
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-white/70">В этом разделе пока нет постов.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-white/60">
                <th className="text-left px-3 py-2 font-medium">ID</th>
                <th className="text-left px-3 py-2 font-medium">Заголовок</th>
                <th className="text-left px-3 py-2 font-medium">Тип</th>
                <th className="text-left px-3 py-2 font-medium">Slug</th>
                <th className="text-left px-3 py-2 font-medium">Статус</th>
                <th className="text-left px-3 py-2 font-medium">Создан</th>
                <th className="text-right px-3 py-2 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02]"
                >
                  <td className="px-3 py-3 align-top text-white/70">
                    #{post.id}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="font-semibold leading-snug">{post.title}</div>
                    <div className="text-xs text-white/50">
                      {`/post/${post.slug}`}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    {getTypeLabel(post.type)}
                  </td>
                  <td className="px-3 py-3 align-top text-white/70 break-all">
                    {post.slug}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span
                      className={`text-xs uppercase tracking-[0.12em] rounded-full px-3 py-1 ${
                        post.isPublished
                          ? "border border-emerald-400/60 text-emerald-200"
                          : "border border-yellow-400/60 text-yellow-200"
                      }`}
                    >
                      {post.isPublished ? "Опубликован" : "Черновик"}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top text-white/70">
                    {new Date(post.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-3 py-3 align-top text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-sm underline underline-offset-4"
                      >
                        Редактировать
                      </Link>
                      <DeletePostButton postId={post.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
