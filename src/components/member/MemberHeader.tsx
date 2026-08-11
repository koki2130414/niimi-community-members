import Link from "next/link";
import { signOutAction } from "@/lib/actions/auth-actions";

const NAV_ITEMS = [
  { href: "/member", label: "ホーム" },
  { href: "/member/videos", label: "動画" },
  { href: "/member/articles", label: "ブログ" },
  { href: "/member/benefits", label: "お得な情報" },
  { href: "/member/events", label: "イベント" },
  { href: "/member/materials", label: "資料" },
  { href: "/member/announcements", label: "お知らせ" },
];

const NOTE_URL = "https://note.com/koki213";
const BOOK_STEP_URL = "https://book-step-kappa.vercel.app/home";

export function MemberHeader({ siteName, displayName }: { siteName: string; displayName: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-brand-beige bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/member" className="text-base font-bold text-brand-green-dark">
          {siteName}
        </Link>
        <nav className="hidden gap-5 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-brand-green-dark hover:text-brand-gold"
            >
              {item.label}
            </Link>
          ))}
          <a
              href={NOTE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-brand-green-dark hover:text-brand-gold"
            >
            Note
          </a>
          <a
              href={BOOK_STEP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-brand-green-dark hover:text-brand-gold"
            >
            BOOK STEP
          </a>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/member/mypage" className="text-sm font-medium text-brand-green-dark hover:text-brand-gold">
            {displayName}さん
          </Link>
          <form action={signOutAction}>
            <button className="text-sm font-medium text-brand-green-light hover:text-brand-danger" type="submit">
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
