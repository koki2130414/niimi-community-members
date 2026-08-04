export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-xl font-bold text-brand-green-dark">利用規約</h1>
      <div className="space-y-4 text-sm leading-relaxed text-brand-green-dark">
        <p>
          この利用規約（以下、「本規約」といいます。）は、にいみコミュニティ メンバーズ（以下、「本サービス」といいます。）の利用条件を定めるものです。
        </p>
        <h2 className="font-bold">第1条（アカウントの管理）</h2>
        <p>
          会員は、運営事務局より発行されたログインID・パスワードを自己の責任において適切に管理するものとし、第三者への貸与・共有を行ってはなりません。
        </p>
        <h2 className="font-bold">第2条（禁止事項）</h2>
        <p>
          会員は、本サービスの利用にあたり、コンテンツの無断転載・再配布、不正アクセス、その他運営事務局が不適切と判断する行為を行ってはなりません。
        </p>
        <h2 className="font-bold">第3条（会員資格の停止・削除）</h2>
        <p>
          運営事務局は、会員が本規約に違反したと認めた場合、事前の通知なく当該会員の利用を停止することができます。
        </p>
        <p className="text-xs text-brand-green-light">
          ※本ページは雛形です。実際の運用にあたっては、専門家の確認のもと内容を精査してください。
        </p>
      </div>
    </div>
  );
}
