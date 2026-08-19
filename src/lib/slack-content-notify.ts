const SITE_URL = "https://niimi-community-members.vercel.app";

/** 動画・講座などのコンテンツ更新をSlackの #content-updates チャンネルへ通知する。 */
export async function notifyContentUpdate(params: { emoji: string; label: string; title: string; path?: string }) {
  const webhookUrl = process.env.SLACK_CONTENT_WEBHOOK_URL;
  if (!webhookUrl) return;

  const link = params.path ? `\n🔗 アプリで見る: ${SITE_URL}${params.path}` : "";
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `${params.emoji} ${params.label}\n*${params.title}*${link}`,
    }),
  }).catch(() => {});
}
