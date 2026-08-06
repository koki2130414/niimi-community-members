import { redirect } from "next/navigation";

/**
 * チャンネル別の投稿・固定・削除などの操作は /member/chat/[slug] 内に
 * 管理者向けコントロールとしてすでに実装されているため、ここでは
 * そのままリダイレクトする。
 */
export default function AdminChatPage() {
  redirect("/member/chat/general");
}
