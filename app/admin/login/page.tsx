import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLoginForm from "./AdminLoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const rawNext = params?.next;
  const next = rawNext && rawNext.startsWith("/admin") ? rawNext : "/admin";

  const user = await getCurrentUser();
  if (user?.role === "ADMIN") redirect("/admin");
  if (user) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.02] p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-6">Вход в админку</h1>
        <p className="text-sm text-white/60 mb-4">
          Укажи логин и пароль, чтобы попасть в админку.
        </p>

        <AdminLoginForm next={next} />
      </div>
    </div>
  );
}
