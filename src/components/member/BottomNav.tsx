"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/member", label: "ホーム", icon: "🏠" },
  { href: "/member/videos", label: "動画", icon: "🎬" },
  { href: "/member/articles", label: "ブログ", icon: "📝" },
  { href: "/member/mypage", label: "マイページ", icon: "👤" },
];

const NOTE_URL = "https://note.com/koki213";

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-brand-beige bg-white md:hidden">
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${
                active ? "text-brand-green font-bold" : "text-brand-green-light"
              }`}
            >
              <span aria-hidden className="text-lg leading-none">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
        <a
            href={NOTE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-brand-green-light"
          >
          <span aria-hidden className="text-lg leading-none">
              📔
          </span>
          Note</a>
      </div>
    </nav>
  );
}
