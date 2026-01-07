import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import CreateAlbumForm from "./CreateAlbumForm";

export const runtime = "nodejs";

export default async function NewAlbumPage() {
  const requestedPath = "/admin/photos/new";
  const user = await getCurrentUser();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(requestedPath)}`);
  if (user.role !== "ADMIN") redirect("/");

  return (
    <main className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/admin/photos"
        className="text-sm text-white/60 hover:text-white inline-flex items-center gap-2"
      >
        ← Back to albums
      </Link>

      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.14em] text-white/60">
          Photos
        </p>
        <h1 className="text-3xl font-bold">Create album</h1>
      </div>

      <CreateAlbumForm />
    </main>
  );
}
