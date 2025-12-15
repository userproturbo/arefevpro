import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTypeLabel } from "@/lib/adminPostTypes";
import { prisma } from "@/lib/prisma";
import DeletePostButton from "./posts/DeletePostButton";
import VisitorStats from "./VisitorStats";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/admin/login?next=/admin");
  }

  const isSuperAdmin = user.id === 1;

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      isPublished: true,
      createdAt: true,
    },
  });

  return (
    <main className="max-w-5xl mx-auto space-y-8">
      {/* Заголовок + кнопка */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-white/60">
            Админка
          </p>
          <h1 className="text-3xl font-bold">Управление CRAZYLIFE</h1>
        </div>

        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-white text-black px-4 py-2 font-semibold hover:bg-white/90"
        >
          Создать пост
        </Link>
      </div>

      {/* ✅ Статистика посетителей — только суперадмин */}
      {isSuperAdmin && <VisitorStats />}

      {/* Контент */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Контент</h2>

        {posts.length === 0 ? (
          <p className="text-white/70">Постов пока нет.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-white/60">
                  <th className="text-left px-3 py-2 font-medium">ID</th>
                  <th className="text-left px-3 py-2 font-medium">
                    Заголовок
                  </th>
                  <th className="text-left px-3 py-2 font-medium">Тип</th>
                  <th className="text-left px-3 py-2 font-medium">Slug</th>
                  <th className="text-left px-3 py-2 font-medium">Статус</th>
                  <th className="text-left px-3 py-2 font-medium">Создан</th>
                  <th className="text-right px-3 py-2 font-medium">
                    Действия
                  </th>
                </tr>
              </thead>

              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="rounded-xl border border-white/10 bg-white/[0.02]"
                  >
                    <td className="px-3 py-3 text-white/70">
                      #{post.id}
                    </td>

                    <td className="px-3 py-3">
                      <div className="font-semibold">{post.title}</div>
                      <div className="text-xs text-white/50">
                        /post/{post.slug}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      {getTypeLabel(post.type)}
                    </td>

                    <td className="px-3 py-3 text-white/70 break-all">
                      {post.slug}
                    </td>

                    <td className="px-3 py-3">
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

                    <td className="px-3 py-3 text-white/70">
                      {new Date(post.createdAt).toLocaleDateString("ru-RU")}
                    </td>

                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="underline underline-offset-4"
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
      </section>
    </main>
  );
}
