import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { canViewContent, isMemberActive } from "@/lib/permissions";

// ファイルは /storage/materials（publicディレクトリの外）に保存し、
// このAPI経由でのみ、ログイン済み・権限のある会員だけがダウンロードできるようにする。
const STORAGE_ROOT = path.join(process.cwd(), "storage", "materials");

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.deletedAt || !isMemberActive(user.status, user.expiresAt)) {
    return NextResponse.json({ error: "アクセス権限がありません" }, { status: 403 });
  }

  const material = await prisma.downloadMaterial.findUnique({ where: { id: params.id } });
  if (!material || material.deletedAt || !material.isPublished) {
    return NextResponse.json({ error: "資料が見つかりません" }, { status: 404 });
  }

  if (!canViewContent(user.membershipPlan, material.allowedPlans)) {
    return NextResponse.json({ error: "この資料を閲覧する権限がありません" }, { status: 403 });
  }

  // fileStorageKey にパス区切り文字が含まれないことを検証し、ディレクトリトラバーサルを防ぐ
  if (material.fileStorageKey.includes("..") || material.fileStorageKey.includes("/")) {
    return NextResponse.json({ error: "不正なファイル指定です" }, { status: 400 });
  }

  const filePath = path.join(STORAGE_ROOT, material.fileStorageKey);

  try {
    const fileBuffer = await readFile(filePath);
    await prisma.$transaction([
      prisma.downloadMaterial.update({
        where: { id: material.id },
        data: { downloadCount: { increment: 1 } },
      }),
      prisma.downloadLog.create({
        data: { userId: user.id, materialId: material.id },
      }),
    ]);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(material.fileName)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "ファイルの読み込みに失敗しました" }, { status: 500 });
  }
}
