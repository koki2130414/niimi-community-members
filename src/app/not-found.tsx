import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-cream px-4 text-center">
      <p className="text-5xl">🌾</p>
      <h1 className="text-lg font-bold text-brand-green-dark">お探しのページが見つかりませんでした</h1>
      <p className="text-sm text-brand-green-light">URLが正しいかご確認いただくか、ホームへお戻りください。</p>
      <Link href="/" className="rounded-card bg-brand-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-dark">
        ホームへ戻る
      </Link>
    </div>
  );
}
