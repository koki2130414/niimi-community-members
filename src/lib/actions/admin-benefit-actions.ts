"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-helpers";
import { serializeAllowedPlans, type MembershipPlan } from "@/lib/permissions";
import { recordAdminLog } from "@/lib/admin-log";

const schema = z.object({
  title: z.string().min(1, "特典名を入力してください").max(200),
  summary: z.string().max(500).optional(),
  detailHtml: z.string().max(5000).optional(),
  conditions: z.string().max(1000).optional(),
  couponCode: z.string().max(100).optional(),
  howTo: z.string().max(1000).optional(),
  validUntil: z.string().optional(),
  isPublished: z.boolean(),
  allowedPlans: z.array(z.enum(["FREE", "STANDARD", "PREMIUM", "ADMIN"])).min(1),
});

export type BenefitFormState = { error?: string };

export async function createBenefit(_prev: BenefitFormState, formData: FormData): Promise<BenefitFormState> {
  const session = await requireAdminSession();
  const parsed = schema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary") || undefined,
    detailHtml: formData.get("detailHtml") || undefined,
    conditions: formData.get("conditions") || undefined,
    couponCode: formData.get("couponCode") || undefined,
    howTo: formData.get("howTo") || undefined,
    validUntil: formData.get("validUntil") || undefined,
    isPublished: formData.get("isPublished") === "on",
    allowedPlans: formData.getAll("allowedPlans") as MembershipPlan[],
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "入力内容を確認してください" };

  const benefit = await prisma.benefit.create({
    data: {
      ...parsed.data,
      validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
      allowedPlans: serializeAllowedPlans(parsed.data.allowedPlans),
    },
  });

  await recordAdminLog({ actorId: session.user.id, action: "benefit.create", targetType: "Benefit", targetId: benefit.id });
  revalidatePath("/admin/benefits");
  return {};
}

export async function deleteBenefit(id: string) {
  const session = await requireAdminSession();
  await prisma.benefit.update({ where: { id }, data: { deletedAt: new Date(), isPublished: false } });
  await recordAdminLog({ actorId: session.user.id, action: "benefit.delete", targetType: "Benefit", targetId: id });
  revalidatePath("/admin/benefits");
}
