import Link from "next/link";

const NAV_GROUPS = [
  {
    items: [{ href: "/admin", label: "ダッシュボード", icon: "📊" }],
  },
  {
    heading: "コンテンツ管理",
    items: [
      { href: "/admin/members", label: "会員管理", icon: "👥" },
      { href: "/admin/videos", label: "動画管理", icon: "🎬" },
      { href: "/admin/courses", label: "講座管理", icon: "🎓" },
      { href: "/admin/articles", label: "記事管理", icon: "📝" },
      { href: "/admin/announcements", label: "お知らせ管理", icon: "📣" },
      { href: "/admin/benefits", label: "特典管理", icon: "🎁" },
      { href: "/admin/events", label: "イベント管理", icon: "📅" },
      { href: "/admin/materials", label: "資料管理", icon: "📁" },
    ],
  },
  {
    heading: "コミュニティ管理",
    items: [
      { href: "/admin/chat", label: "チャット管理", icon: "💬" },
      { href: "/admin/messages", label: "メッセージ監視", icon: "🔍" },
      { href: "/admin/points", label: "ポイント管理", icon: "⭐" },
    ],
  },
  {
    heading: "システム",
    items: [{ href: "/admin/settings", label: "サイト設定", icon: "⚙️" }],
  },
];

export function AdminNav() {
  return (
    <nav className="space-y-6">
      {NAV_GROUPS.map((group, i) => (
        <div key={i}>
          {group.heading && (
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-brand-green-light">
              {group.heading}
            </p>
          )}
          <div className="space-y-1">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-brand-green-dark hover:bg-brand-cream"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
