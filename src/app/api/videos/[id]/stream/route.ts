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
 *
 * 重要: クライアントからの Range ヘッダー（シーク操作）を Blob 取得にもそのまま
 * 引き継ぎ、206 Partial Content で返す。iOS Safari 等のモバイルブラウザは
 * Range 対応していない動画配信を再生できないことが多いため必須の対応。
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
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

  const range = request.headers.get("range") ?? undefined;

  const result = await get(video.filePath, {
    access: "private",
    headers: range ? { range } : undefined,
  });
  if (!result || !result.stream) {
    return new NextResponse("動画の取得に失敗しました", { status: 502 });
  }

  const contentRange = result.headers.get("content-range");
  const contentLength = result.headers.get("content-length");
  const acceptRanges = result.headers.get("accept-ranges") ?? "bytes";

  const headers = new Headers({
    "Content-Type": video.fileMimeType || result.blob.contentType || "video/mp4",
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": acceptRanges,
  });
  if (contentLength) headers.set("Content-Length", contentLength);
  if (contentRange) headers.set("Content-Range", contentRange);

  return new NextResponse(result.stream, {
    status: contentRange ? 206 : 200,
    headers,
  });
}
