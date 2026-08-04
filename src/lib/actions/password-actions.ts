"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { changePasswordSchema } from "@/lib/validators";

export type PasswordChangeState = { error?: string; success?: boolean };

export async function changeMyPassword(
  _prev: PasswordChangeState,
  formData: FormData
): Promise<PasswordChangeState> {
  const session = await requireMemberSession();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    newPasswordConfirm: formData.get("newPasswordConfirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "入力内容を確認してください" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "会員情報が見つかりません" };

  const matches = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!matches) {
    return { error: "現在のパスワードが正しくありません" };
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash, mustChangePassword: false },
  });

  return { success: true };
}
