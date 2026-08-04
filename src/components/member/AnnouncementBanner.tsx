import Link from "next/link";

export function AnnouncementBanner({ title, href }: { title: string; href: string }) {
  return (
    <Link
      href={href}
      className="block rounded-card border border-brand-gold bg-brand-gold-light px-4 py-3 text-sm font-semibold text-brand-green-dark shadow-sm"
    >
      📣 重要なお知らせ：{title}
    </Link>
  );
}
