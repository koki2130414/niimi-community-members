import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// カスタムドメイン未設定のため、当面はResendの検証済み送信元アドレスを使う。
// 独自ドメインを検証したら from を切り替える。
const FROM_ADDRESS = "IPPOS コミュニティ <onboarding@resend.dev>";

/** パスワード再設定メールを送信する。RESEND_API_KEY未設定時は何もしない（開発環境向け）。 */
export async function sendPasswordResetEmail(params: { to: string; resetUrl: string; siteName: string }) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set; skipping password reset email send.");
    return;
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: params.to,
    subject: `【${params.siteName}】パスワード再設定のご案内`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #1F3A28;">
        <p>いつも${params.siteName}をご利用いただきありがとうございます。</p>
        <p>パスワード再設定のリクエストを受け付けました。下記のリンクより、新しいパスワードを設定してください（このリンクの有効期限は60分です）。</p>
        <p>
          <a href="${params.resetUrl}" style="display: inline-block; background: #2F4F3A; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            パスワードを再設定する
          </a>
        </p>
        <p style="font-size: 12px; color: #888;">
          ボタンが機能しない場合は、以下のURLをブラウザに貼り付けてください。<br />
          ${params.resetUrl}
        </p>
        <p style="font-size: 12px; color: #888;">
          このメールに心当たりがない場合は、無視していただいて問題ございません。
        </p>
      </div>
    `,
  });
}
