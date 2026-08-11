import { requireAdminSession } from "@/lib/auth-helpers";
import { createCourse } from "@/lib/actions/admin-course-actions";
import { Card, CardBody } from "@/components/ui/Card";
import { Label, Input, Select, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export default async function AdminCourseNewPage() {
  await requireAdminSession();

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-xl font-bold text-brand-green-dark">講座を新規作成</h1>
      <Card>
        <CardBody>
          <form action={createCourse} className="space-y-4">
            <div>
              <Label htmlFor="title">講座タイトル</Label>
              <Input id="title" name="title" required />
            </div>
            <div>
              <Label htmlFor="domain">分野</Label>
              <Select id="domain" name="domain" defaultValue="ai">
                <option value="ai">AI講座</option>
                <option value="psychology">心理学</option>
                <option value="agriculture">農業</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">説明</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>
            <div>
              <Label htmlFor="pointsOnComplete">修了ポイント</Label>
              <Input id="pointsOnComplete" name="pointsOnComplete" type="number" defaultValue={20} />
            </div>
            <label className="flex items-center gap-1.5 text-sm text-brand-green-dark">
              <input type="checkbox" name="isPublished" />
              公開する
            </label>
            <Button type="submit">作成する</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
