import { requireAdminSession } from "@/lib/auth-helpers";
import { getSiteName } from "@/lib/site-settings";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";
import { Card, CardBody } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminSession();
  const siteName = await getSiteName();

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-xl font-bold text-brand-green-dark">サイト設定</h1>
      <Card>
        <CardBody>
          <SiteSettingsForm defaultSiteName={siteName} />
          <p className="mt-3 text-xs text-brand-green-light">
            サービス名はヘッダーやページタイトルに反映されます。ブランドカラーの変更は `tailwind.config.ts`
            の編集が必要です（開発担当者にご依頼ください）。
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
