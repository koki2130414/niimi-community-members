import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

/** 講座レッスン動画の会員限定ストリーミング配信（Videoモデルと同じ private Blob 経由の方式）。 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireMemberSession();
  } catch {
    return new NextResponse("ログインが必要です", { status: 401 });
  }

  const lesson = await prisma.courseLesson.findUnique({ where: { id: params.id } });
  if (!lesson || lesson.videoSourceType !== "upload" || !lesson.filePath) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const range = request.headers.get("range") ?? undefined;
  const result = await get(lesson.filePath, { access: "private", headers: range ? { range } : undefined });
  if (!result || !result.stream) {
    return new NextResponse("動画の取得に失敗しました", { status: 502 });
  }

  const contentRange = result.headers.get("content-range");
  const contentLength = result.headers.get("content-length");
  const headers = new Headers({
    "Content-Type": lesson.fileMimeType || result.blob.contentType || "video/mp4",
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": result.headers.get("accept-ranges") ?? "bytes",
  });
  if (contentLength) headers.set("Content-Length", contentLength);
  if (contentRange) headers.set("Content-Range", contentRange);

  return new NextResponse(result.stream, { status: contentRange ? 206 : 200, headers });
}
