import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

// 本番DBへの初回セットアップ専用エンドポイント。
// SEED_SECRET と一致するsecretクエリパラメータを渡した場合のみ実行される。
// 全てupsertのため、複数回呼び出しても安全（冪等）。
// 資料ファイルの実体はサーバーレス環境の一時領域には書き込まず、
// クラウドストレージ移行後に別途登録する運用を想定し、メタデータのみ作成する。

const DEV_PASSWORD = "DevPass123";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");

  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  await prisma.siteSetting.upsert({
        where: { key: "site.name" },
        update: {},
        create: { key: "site.name", value: "にいみコミュニティ メンバーズ" },
  });

  await prisma.membershipPlanConfig.createMany({
        data: [
          { plan: "FREE", label: "無料会員", sortOrder: 1 },
          { plan: "STANDARD", label: "通常会員", sortOrder: 2 },
          { plan: "PREMIUM", label: "プレミアム会員", sortOrder: 3 },
          { plan: "ADMIN", label: "管理者", sortOrder: 4 },
              ],
        skipDuplicates: true,
  });

  await prisma.user.upsert({
        where: { loginId: "admin" },
        update: {},
        create: {
                loginId: "admin",
                email: "admin@example.com",
                passwordHash,
                name: "管理者 太郎",
                displayName: "管理者",
                membershipPlan: "ADMIN",
                status: "ACTIVE",
        },
  });

  for (const i of [1, 2, 3]) {
        await prisma.user.upsert({
                where: { loginId: `member${i}` },
                update: {},
                create: {
                          loginId: `member${i}`,
                          email: `member${i}@example.com`,
                          passwordHash,
                          name: `会員 ${i}号`,
                          displayName: `会員${i}`,
                          membershipPlan: "STANDARD",
                          status: "ACTIVE",
                },
        });
  }

  await prisma.user.upsert({
        where: { loginId: "premium1" },
        update: {},
        create: {
                loginId: "premium1",
                email: "premium1@example.com",
                passwordHash,
                name: "プレミアム 花子",
                displayName: "プレミアム花子",
                membershipPlan: "PREMIUM",
                status: "ACTIVE",
        },
  });

  const videoCategory = await prisma.videoCategory.upsert({
        where: { name: "稲作の基本" },
        update: {},
        create: { name: "稲作の基本", sortOrder: 1 },
  });

  const videoSamples = [
    { title: "田植えの様子2026", desc: "今年の田植え作業の様子をお届けします。", featured: true },
    { title: "水管理のコツ", desc: "夏場の水管理で気をつけているポイントを解説します。" },
    { title: "草刈り作業ダイジェスト", desc: "畦道の草刈り作業をダイジェストでご紹介。" },
    { title: "会員限定：中干しのタイミング解説", desc: "プレミアム会員向けの詳しい解説動画です。", plans: "PREMIUM,ADMIN" },
    { title: "収穫の様子2025", desc: "昨年の稲刈り〜収穫までの記録動画です。" },
      ];
    for (const [i, v] of videoSamples.entries()) {
          await prisma.video.upsert({
                  where: { id: `seed-video-${i + 1}` },
                  update: {},
                  create: {
                            id: `seed-video-${i + 1}`,
                            title: v.title,
                            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                            youtubeId: "dQw4w9WgXcQ",
                            description: v.desc,
                            categoryId: videoCategory.id,
                            isPublished: true,
                            isFeatured: v.featured ?? false,
                            allowedPlans: v.plans ?? "FREE,STANDARD,PREMIUM,ADMIN",
                            publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
                  },
          });
    }

  const articleCategory = await prisma.articleCategory.upsert({
        where: { name: "農園だより" },
        update: {},
        create: { name: "農園だより", sortOrder: 1 },
  });

  const articleSamples = [
    { title: "2026年、田植えを終えて", summary: "今年の田植えを振り返ります。", featured: true },
    { title: "コミュニティ交流会レポート", summary: "先日開催した交流会の様子をお届けします。" },
    { title: "お米の美味しい炊き方", summary: "にいみ農園のお米をより美味しく食べる方法。" },
    { title: "会員限定：来年度の作付け計画", summary: "プレミアム会員限定の先行情報です。", plans: "PREMIUM,ADMIN" },
    { title: "農機具メンテナンス記録", summary: "定期メンテナンスの記録です。" },
      ];
    for (const [i, a] of articleSamples.entries()) {
          await prisma.article.upsert({
                  where: { id: `seed-article-${i + 1}` },
                  update: {},
                  create: {
                            id: `seed-article-${i + 1}`,
                            title: a.title,
                            summary: a.summary,
                            bodyHtml: `<p>${a.summary}</p><p>これは初期表示用のサンプル本文です。管理画面から実際の記事に更新してください。</p>`,
                            categoryId: articleCategory.id,
                            authorName: "新見農園",
                            isPublished: true,
                            isFeatured: a.featured ?? false,
                            allowedPlans: a.plans ?? "FREE,STANDARD,PREMIUM,ADMIN",
                            publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
                  },
          });
    }

  const announcementSamples = [
    { title: "サイトオープンのお知らせ", importance: "IMPORTANT" as const },
    { title: "夏季休業のご案内", importance: "NORMAL" as const },
    { title: "新機能追加のお知らせ", importance: "NORMAL" as const },
      ];
    for (const [i, an] of announcementSamples.entries()) {
          await prisma.announcement.upsert({
                  where: { id: `seed-announcement-${i + 1}` },
                  update: {},
                  create: {
                            id: `seed-announcement-${i + 1}`,
                            title: an.title,
                            bodyHtml: `<p>${an.title}の詳細です。管理画面から本文を編集できます。</p>`,
                            importance: an.importance,
                            isPublished: true,
                            publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
                  },
          });
    }

  const benefitSamples = [
    { title: "お米の会員限定割引", coupon: "RICE2026" },
    { title: "イベント参加費割引", coupon: "EVENT500" },
    { title: "提携店舗の割引", coupon: "PARTNER10" },
      ];
    for (const [i, b] of benefitSamples.entries()) {
          await prisma.benefit.upsert({
                  where: { id: `seed-benefit-${i + 1}` },
                  update: {},
                  create: {
                            id: `seed-benefit-${i + 1}`,
                            title: b.title,
                            summary: `${b.title}のご案内です。`,
                            conditions: "会員であればどなたでもご利用いただけます。",
                            howTo: "クーポンコードをレジにてご提示ください。",
                            couponCode: b.coupon,
                            validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                            isPublished: true,
                  },
          });
    }

  const eventSamples = [
    { title: "秋の収穫祭2026", status: "OPEN" as const, days: 30 },
    { title: "会員交流ミーティング", status: "UPCOMING" as const, days: 45 },
    { title: "夏の田んぼ観察会（終了）", status: "FINISHED" as const, days: -20 },
      ];
    for (const [i, e] of eventSamples.entries()) {
          await prisma.event.upsert({
                  where: { id: `seed-event-${i + 1}` },
                  update: {},
                  create: {
                            id: `seed-event-${i + 1}`,
                            title: e.title,
                            startsAt: new Date(Date.now() + e.days * 24 * 60 * 60 * 1000),
                            location: "とちぎ農業交流センター",
                            summary: `${e.title}の詳細です。`,
                            capacity: 30,
                            fee: "無料",
                            applyUrl: "https://forms.gle/example",
                            status: e.status,
                  },
          });
    }

  return NextResponse.json({
        ok: true,
        message: "初期データを投入しました。管理者ログイン: admin / DevPass123（本番運用前に必ず変更してください）",
  });
}
