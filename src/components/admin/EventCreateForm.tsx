"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createEvent, type EventFormState } from "@/lib/actions/admin-event-actions";
import { Label, Input, Textarea, Select, FieldError } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { AllowedPlansCheckboxGroup } from "@/components/admin/AllowedPlansCheckboxGroup";
import { EVENT_STATUS_LABELS } from "@/lib/content-status";

const initialState: EventFormState = {};

export function EventCreateForm() {
  const [state, formAction] = useFormState(createEvent, initialState);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="title">イベント名</Label>
        <Input id="title" name="title" required />
      </div>
      <div>
        <Label htmlFor="startsAt">開催日時</Label>
        <Input id="startsAt" name="startsAt" type="datetime-local" required />
      </div>
      <div>
        <Label htmlFor="endsAt">終了日時（任意）</Label>
        <Input id="endsAt" name="endsAt" type="datetime-local" />
      </div>
      <div>
        <Label htmlFor="location">開催場所</Label>
        <Input id="location" name="location" />
      </div>
      <div>
        <Label htmlFor="onlineUrl">オンラインURL（任意）</Label>
        <Input id="onlineUrl" name="onlineUrl" type="url" />
      </div>
      <div>
        <Label htmlFor="summary">イベント概要</Label>
        <Textarea id="summary" name="summary" rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="capacity">定員</Label>
          <Input id="capacity" name="capacity" type="number" min={0} />
        </div>
        <div>
          <Label htmlFor="fee">参加費</Label>
          <Input id="fee" name="fee" placeholder="無料 / 1,000円" />
        </div>
      </div>
      <div>
        <Label htmlFor="applyDeadline">申込期限（任意）</Label>
        <Input id="applyDeadline" name="applyDeadline" type="datetime-local" />
      </div>
      <div>
        <Label htmlFor="applyUrl">申込URL（Googleフォーム等）</Label>
        <Input id="applyUrl" name="applyUrl" type="url" />
      </div>
      <div>
        <Label htmlFor="status">開催ステータス</Label>
        <Select id="status" name="status" defaultValue="UPCOMING">
          {Object.entries(EVENT_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </div>
      <AllowedPlansCheckboxGroup defaultValue={["FREE", "STANDARD", "PREMIUM"]} />
      <FieldError message={state.error} />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "登録中..." : "イベントを登録する"}
    </Button>
  );
}
