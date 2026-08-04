import type { Metadata } from "next";
import "./globals.css";
import { getSiteName } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return {
    title: siteName,
    description: `${siteName} - 会員限定コンテンツサイト`,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
