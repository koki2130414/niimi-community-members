"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ja">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-cream px-4 text-center">
          <p className="text-5xl">⚠️</p>
          <h1 className="text-lg font-bold text-brand-green-dark">エラーが発生しました</h1>
          <p className="text-sm text-brand-green-light">
            一時的な問題が発生した可能性があります。しばらくしてから再度お試しください。
          </p>
          <button
            onClick={() => reset()}
            className="rounded-card bg-brand-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-dark"
          >
            再読み込みする
          </button>
        </div>
      </body>
    </html>
  );
}
