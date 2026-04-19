import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/admin");

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🏺</span>
          <h1 className="text-2xl font-bold text-amber-900">כניסה לניהול</h1>
          <p className="text-stone-400 text-sm mt-1">סטודיו קדרות</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
