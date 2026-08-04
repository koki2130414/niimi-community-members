export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-xl font-bold text-brand-green-dark">プライバシーポリシー</h1>
      <div className="space-y-4 text-sm leading-relaxed text-brand-green-dark">
        <h2 className="font-bold">1. 取得する情報</h2>
        <p>
          本サービスでは、会員登録時に氏名・表示名・メールアドレス・ログインIDのみを取得します。住所・電話番号など、サービス提供に不要な個人情報は取得しません。
        </p>
        <h2 className="font-bold">2. 利用目的</h2>
        <p>取得した情報は、本人確認、コンテンツ配信、お知らせの送付、サービス改善の目的にのみ利用します。</p>
        <h2 className="font-bold">3. パスワードの取り扱い</h2>
        <p>パスワードは安全なハッシュ関数により変換して保存し、運営事務局を含め、平文のパスワードを閲覧することはできません。</p>
        <h2 className="font-bold">4. 第三者提供</h2>
        <p>法令に基づく場合を除き、本人の同意なく第三者に個人情報を提供することはありません。</p>
        <p className="text-xs text-brand-green-light">
          ※本ページは雛形です。実際の運用にあたっては、専門家の確認のもと内容を精査してください。
        </p>
      </div>
    </div>
  );
}
