import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminNavbar } from "@/components/admin/AdminNavbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // דף הלוגין נמצא גם הוא תחת layout זה — אל תציג navbar אם אין סשן
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {children}
      </main>
    </div>
  );
}
