import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireAdminSession } from "@/lib/auth-helpers";

/**
 * 管理者が動画ファイルをブラウザから直接 Vercel Blob へアップロードするための
 * 認可エンドポイント。実ファイルはサーバーを経由せずクライアント→Blobへ直接送られる
 * （Vercelのサーバーレス関数のボディサイズ上限を回避するため）。
 * ここでは「誰がアップロードを許可されるか」だけを判定し、実データには一切触れない。
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    // アップロード開始前に必ず管理者セッションを確認する。
    await requireAdminSession();

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          // 動画ファイルのみ許可。会員限定配信のため公開URLとしては使わず、
          // /api/videos/[id]/stream からサーバー経由でのみ配信する。
          allowedContentTypes: ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ pathname }),
        };
      },
      onUploadCompleted: async () => {
        // アップロード完了後の追加処理は不要（DBへの登録はクライアント側で別途サーバーアクションを呼ぶ）
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "アップロードが許可されていません" }, { status: 403 });
  }
}
