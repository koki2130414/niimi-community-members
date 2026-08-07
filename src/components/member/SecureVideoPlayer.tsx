"use client";

/**
 * 会員限定動画の再生プレイヤー。
 * イベントハンドラ（右クリック禁止など）はクライアントコンポーネントでのみ使えるため、
 * Server Component から切り出している。
 */
export function SecureVideoPlayer({ src }: { src: string }) {
  return (
    <video
      className="h-full w-full"
      src={src}
      controls
      controlsList="nodownload"
      disablePictureInPicture
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
