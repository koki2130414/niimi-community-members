"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-helpers";
import { serializeAllowedPlans, type MembershipPlan } from "@/lib/permissions";
import { recordAdminLog } from "@/lib/admin-log";

const schema = z.object({
  title: z.string().min(1, "イベント名を入力してください").max(200),
  startsAt: z.string().min(1, "開催日時を入力してください"),
  endsAt: z.string().optional(),
  location: z.string().max(200).optional(),
  onlineUrl: z.string().url().optional().or(z.literal("")),
  summary: z.string().max(2000).optional(),
  capacity: z.string().optional(),
  fee: z.string().max(100).optional(),
  applyDeadline: z.string().optional(),
  applyUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["UPCOMING", "OPEN", "FULL", "CLOSED", "FINISHED", "CANCELED"]),
  allowedPlans: z.array(z.enum(["FREE", "STANDARD", "PREMIUM", "ADMIN"])).min(1),
});

export type EventFormState = { error?: string };

export async function createEvent(_prev: EventFormState, formData: FormData): Promise<EventFormState> {
  const session = await requireAdminSession();
  const parsed = schema.safeParse({
    title: formData.get("title"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt") || undefined,
    location: formData.get("location") || undefined,
    onlineUrl: formData.get("onlineUrl") || "",
    summary: formData.get("summary") || undefined,
    capacity: formData.get("capacity") || undefined,
    fee: formData.get("fee") || undefined,
    applyDeadline: formData.get("applyDeadline") || undefined,
    applyUrl: formData.get("applyUrl") || "",
    status: formData.get("status") ?? "UPCOMING",
    allowedPlans: formData.getAll("allowedPlans") as MembershipPlan[],
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "入力内容を確認してください" };

  const event = await prisma.event.create({
    data: {
      title: parsed.data.title,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
      location: parsed.data.location,
      onlineUrl: parsed.data.onlineUrl || null,
      summary: parsed.data.summary,
      capacity: parsed.data.capacity ? Number(parsed.data.capacity) : null,
      fee: parsed.data.fee,
      applyDeadline: parsed.data.applyDeadline ? new Date(parsed.data.applyDeadline) : null,
      applyUrl: parsed.data.applyUrl || null,
      status: parsed.data.status,
      allowedPlans: serializeAllowedPlans(parsed.data.allowedPlans),
    },
  });

  await recordAdminLog({ actorId: session.user.id, action: "event.create", targetType: "Event", targetId: event.id });
  revalidatePath("/admin/events");
  return {};
}

export async function deleteEvent(id: string) {
  const session = await requireAdminSession();
  await prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
  await recordAdminLog({ actorId: session.user.id, action: "event.delete", targetType: "Event", targetId: id });
  revalidatePath("/admin/events");
}
