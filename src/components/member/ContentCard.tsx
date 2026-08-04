import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface ContentCardProps {
  href: string;
  imageUrl?: string | null;
  title: string;
  subtitle?: string | null;
  dateLabel?: string | null;
  isFeatured?: boolean;
  badgeText?: string | null;
}

/**
 * 動画・記事・特典など複数コンテンツで共通利用するカード。
 * スマートフォンでの視認性を優先し、画像は16:9固定枠にする。
 */
export function ContentCard({
  href,
  imageUrl,
  title,
  subtitle,
  dateLabel,
  isFeatured,
  badgeText,
}: ContentCardProps) {
  return (
    <Link href={href} className="block h-full">
      <Card className="h-full overflow-hidden transition hover:shadow-md">
        <div className="relative aspect-video w-full bg-brand-beige">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-brand-green-light text-sm">
              画像なし
            </div>
          )}
          {isFeatured && (
            <span className="absolute left-2 top-2">
              <Badge tone="gold">おすすめ</Badge>
            </span>
          )}
        </div>
        <div className="p-3">
          {badgeText && (
            <div className="mb-1">
              <Badge tone="neutral">{badgeText}</Badge>
            </div>
          )}
          <h3 className="line-clamp-2 text-sm font-bold text-brand-green-dark">{title}</h3>
          {subtitle && <p className="mt-1 line-clamp-2 text-xs text-brand-green-light">{subtitle}</p>}
          {dateLabel && <p className="mt-1 text-xs text-brand-green-light">{dateLabel}</p>}
        </div>
      </Card>
    </Link>
  );
}
