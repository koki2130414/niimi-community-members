import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 誤って論理削除されたアカウントを復旧するための一時エンドポイント。
export async function GET(req: Request) {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    const loginId = url.searchParams.get("loginId");

  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
    if (!loginId) {
          return NextResponse.json({ error: "loginId is required" }, { status: 400 });
    }

  const user = await prisma.user.findFirst({ where: { loginId } });
    if (!user) {
          return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

  const restored = await prisma.user.update({
        where: { id: user.id },
        data: { deletedAt: null, status: "ACTIVE" },
  });

  return NextResponse.json({ ok: true, restored: { id: restored.id, loginId: restored.loginId, status: restored.status } });
}
