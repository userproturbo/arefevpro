import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import BlogEditor from "../BlogEditor";

export default async function AdminBlogNewPage() {
  const user = await getCurrentUser();
  const requestedPath = "/admin/blog/new";
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(requestedPath)}`);
  if (user.role !== "ADMIN") redirect("/");

  return <BlogEditor mode="new" />;
}
