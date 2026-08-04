import { prisma } from "@/lib/db";

// サービス名を「管理画面から変更しやすい」設計にするため、
// ハードコードせず SiteSetting テーブルから読み出す。
// テーブルに値が無い場合は環境変数 / デフォルト文言にフォールバックする。

const DEFAULT_SITE_NAME = "にいみコミュニティ メンバーズ";

export async function getSiteName(): Promise<string> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: "site.name" } });
    return setting?.value || process.env.NEXT_PUBLIC_SITE_NAME || DEFAULT_SITE_NAME;
  } catch {
    // DB未接続時（ビルド時など）でもページが壊れないようフォールバックする
    return process.env.NEXT_PUBLIC_SITE_NAME || DEFAULT_SITE_NAME;
  }
}

export async function setSiteName(name: string): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: "site.name" },
    update: { value: name },
    create: { key: "site.name", value: name },
  });
}
