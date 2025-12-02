import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "@/app/login/LoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  const next = params?.next;

  if (user?.role === "ADMIN") {
    redirect(next || "/admin");
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.02] p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-6">Вход в админку</h1>
        <p className="text-sm text-white/60 mb-4">
          Укажи логин и пароль автора, чтобы создавать и редактировать посты.
        </p>

        <LoginForm next={next || "/admin"} />
      </div>
    </div>
  );
}
