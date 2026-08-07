import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { canViewContent } from "@/lib/permissions";

export const dynamic = "force-dynamic";

/**
 * 動画配信の要。会員セッションと閲覧権限を確認したうえで、
 * Vercel Blob（private access）上の実ファイルを @vercel/blob の get() で
 * サーバー側からのみ取得し、そのままクライアントへストリーミングする。
 * ファイルの実体は private アクセスのため、このAPIを経由しない限り
 * 何人たりとも（BLOB_READ_WRITE_TOKENを持たない限り）取得できない。
 */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  let session;
  try {
    session = await requireMemberSession();
  } catch {
    return new NextResponse("ログインが必要です", { status: 401 });
  }

  const video = await prisma.video.findUnique({ where: { id: params.id } });
  if (!video || video.deletedAt || !video.isPublished || video.sourceType !== "upload" || !video.filePath) {
    return new NextResponse("Not Found", { status: 404 });
  }
  if (!canViewContent(session.user.membershipPlan, video.allowedPlans)) {
    return new NextResponse("この動画を閲覧する権限がありません", { status: 403 });
  }

  const result = await get(video.filePath, { access: "private" });
  if (!result) {
    return new NextResponse("動画の取得に失敗しました", { status: 502 });
  }

  return new NextResponse(result.stream, {
    status: 200,
    headers: {
      "Content-Type": video.fileMimeType || result.blob.contentType || "video/mp4",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
