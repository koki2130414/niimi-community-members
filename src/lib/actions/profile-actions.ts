"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";

const profileUpdateSchema = z.object({
  name: z.string().min(1, "氏名を入力してください").max(100),
  displayName: z.string().min(1, "表示名を入力してください").max(50),
  email: z.string().email("正しいメールアドレスを入力してください").max(255),
});

export type ProfileUpdateState = { error?: string; success?: boolean };

export async function updateMyProfile(_prev: ProfileUpdateState, formData: FormData): Promise<ProfileUpdateState> {
  const session = await requireMemberSession();

  const parsed = profileUpdateSchema.safeParse({
    name: formData.get("name"),
    displayName: formData.get("displayName"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "入力内容を確認してください" };
  }

  const emailTaken = await prisma.user.findFirst({
    where: { email: parsed.data.email, id: { not: session.user.id } },
  });
  if (emailTaken) {
    return { error: "このメールアドレスは既に使用されています" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  revalidatePath("/member/mypage");
  return { success: true };
}
