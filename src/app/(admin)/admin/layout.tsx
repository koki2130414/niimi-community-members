import Link from "next/link";
import { requireAdminSession } from "@/lib/auth-helpers";
import { getSiteName } from "@/lib/site-settings";
import { AdminNav } from "@/components/admin/AdminNav";
import { signOutAction } from "@/lib/actions/auth-actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();
  const siteName = await getSiteName();

  return (
    <div className="min-h-screen bg-brand-cream md:flex">
      <aside className="border-b border-brand-beige bg-white p-4 md:w-56 md:shrink-0 md:border-b-0 md:border-r">
        <Link href="/admin" className="mb-6 block text-sm font-bold text-brand-green-dark">
          {siteName}
          <span className="ml-1 text-xs font-normal text-brand-green-light">管理画面</span>
        </Link>
        <AdminNav />
        <div className="mt-8 space-y-2 border-t border-brand-beige pt-4">
          <p className="px-2 text-xs text-brand-green-light">{session.user.displayName}（管理者）</p>
          <Link href="/member" className="block px-2 text-xs font-medium text-brand-green hover:text-brand-gold">
            会員画面を表示
          </Link>
          <form action={signOutAction}>
            <button className="px-2 text-xs font-medium text-brand-green-light hover:text-brand-danger" type="submit">
              ログアウト
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
