import { requireMemberSession } from "@/lib/auth-helpers";
import { getSiteName } from "@/lib/site-settings";
import { MemberHeader } from "@/components/member/MemberHeader";
import { BottomNav } from "@/components/member/BottomNav";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await requireMemberSession();
  const siteName = await getSiteName();

  return (
    <div className="min-h-screen bg-brand-cream pb-20 md:pb-0">
      <MemberHeader siteName={siteName} displayName={session.user.displayName} />
      <main className="mx-auto max-w-5xl px-4 py-5">{children}</main>
      <BottomNav />
    </div>
  );
}
