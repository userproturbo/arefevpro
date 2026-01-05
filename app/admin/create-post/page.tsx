import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import CreatePostClient from "./CreatePostClient";

export default async function CreatePostPage() {
  const user = await getCurrentUser();
  const requestedPath = "/admin/create-post";
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(requestedPath)}`);
  if (user.role !== "ADMIN") redirect("/");

  return <CreatePostClient />;
}
