import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MatchingPage() {
  notFound(); // 現在この機能は非公開です
}
