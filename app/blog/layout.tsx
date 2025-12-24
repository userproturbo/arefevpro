import { prisma } from "@/lib/prisma";
import { ReactNode } from "react";
import BlogShell from "./BlogShell";

export const dynamic = "force-dynamic";

export default async function BlogLayout({ children }: { children: ReactNode }) {
  const posts = await prisma.post.findMany({
    where: { type: "BLOG", isPublished: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true },
  });

  return <BlogShell posts={posts}>{children}</BlogShell>;
}
