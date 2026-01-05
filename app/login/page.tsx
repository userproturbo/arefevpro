import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  const params = await searchParams;
  const next = params?.next;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.02] p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-6">Вход</h1>
        <p className="text-sm text-white/60 mb-4">
          Укажи логин и пароль, чтобы войти в аккаунт.
        </p>

        <LoginForm next={next} />
      </div>
    </div>
  );
}
