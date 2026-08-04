import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 診断用の一時エンドポイント。全ユーザー（論理削除済みも含む）の一覧を返す。
export async function GET(req: Request) {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");

  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
        select: {
                id: true,
                loginId: true,
                email: true,
                name: true,
                displayName: true,
                membershipPlan: true,
                status: true,
                deletedAt: true,
                createdAt: true,
        },
        orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ users });
}
