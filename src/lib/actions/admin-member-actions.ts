"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-helpers";
import { memberCreateSchema, memberUpdateSchema } from "@/lib/validators";
import { generateTemporaryPassword } from "@/lib/password-generator";
import { recordAdminLog } from "@/lib/admin-log";

export type MemberFormState = { error?: string; success?: boolean; issuedPassword?: string; loginId?: string };

/** 会員新規登録。ログインIDと仮パスワードを発行する。 */
export async function createMember(_prev: MemberFormState, formData: FormData): Promise<MemberFormState> {
  const session = await requireAdminSession();

  const parsed = memberCreateSchema.safeParse({
    name: formData.get("name"),
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    loginId: formData.get("loginId"),
    membershipPlan: formData.get("membershipPlan"),
    expiresAt: formData.get("expiresAt") || null,
    adminNote: formData.get("adminNote") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "入力内容を確認してください" };
  }

  const [emailTaken, loginIdTaken] = await Promise.all([
    prisma.user.findUnique({ where: { email: parsed.data.email } }),
    prisma.user.findUnique({ where: { loginId: parsed.data.loginId } }),
  ]);
  if (emailTaken) return { error: "このメールアドレスは既に登録されています" };
  if (loginIdTaken) return { error: "このログインIDは既に使用されています" };

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      displayName: parsed.data.displayName,
      email: parsed.data.email,
      loginId: parsed.data.loginId,
      passwordHash,
      membershipPlan: parsed.data.membershipPlan,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      mustChangePassword: true,
      profile: parsed.data.adminNote ? { create: { adminNote: parsed.data.adminNote } } : undefined,
    },
  });

  await recordAdminLog({
    actorId: session.user.id,
    action: "member.create",
    targetType: "User",
    targetId: user.id,
  });

  revalidatePath("/admin/members");
  return { success: true, issuedPassword: temporaryPassword, loginId: user.loginId };
}

export async function updateMember(_prev: MemberFormState, formData: FormData): Promise<MemberFormState> {
  const session = await requireAdminSession();

  const parsed = memberUpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name") || undefined,
    displayName: formData.get("displayName") || undefined,
    email: formData.get("email") || undefined,
    membershipPlan: formData.get("membershipPlan") || undefined,
    status: formData.get("status") || undefined,
    expiresAt: formData.get("expiresAt") || null,
    adminNote: formData.get("adminNote") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "入力内容を確認してください" };
  }

  const { id, adminNote, expiresAt, ...rest } = parsed.data;

  await prisma.user.update({
    where: { id },
    data: {
      ...rest,
      expiresAt: expiresAt === null ? null : expiresAt ? new Date(expiresAt) : undefined,
      profile: adminNote !== undefined
        ? { upsert: { create: { adminNote }, update: { adminNote } } }
        : undefined,
    },
  });

  await recordAdminLog({ actorId: session.user.id, action: "member.update", targetType: "User", targetId: id });

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${id}/edit`);
  return { success: true };
}

export async function suspendMember(id: string) {
  const session = await requireAdminSession();
  await prisma.user.update({ where: { id }, data: { status: "SUSPENDED" } });
  await recordAdminLog({ actorId: session.user.id, action: "member.suspend", targetType: "User", targetId: id });
  revalidatePath("/admin/members");
}

export async function reactivateMember(id: string) {
  const session = await requireAdminSession();
  await prisma.user.update({ where: { id }, data: { status: "ACTIVE" } });
  await recordAdminLog({ actorId: session.user.id, action: "member.reactivate", targetType: "User", targetId: id });
  revalidatePath("/admin/members");
}

/** 論理削除（退会扱い）。要件により物理削除ではなく確認画面経由の論理削除を基本とする。 */
export async function deleteMember(id: string) {
  const session = await requireAdminSession();
  await prisma.user.update({
    where: { id },
    data: { status: "WITHDRAWN", deletedAt: new Date() },
  });
  await recordAdminLog({ actorId: session.user.id, action: "member.delete", targetType: "User", targetId: id });
  revalidatePath("/admin/members");
  redirect("/admin/members");
}

export type IssueTempPasswordState = { issuedPassword?: string };

/** パスワード再設定 / 仮パスワード発行。管理者は平文パスワードを閲覧できない設計のため、
 *  ここで新しい仮パスワードを生成して一度だけ画面表示する。 */
export async function issueTemporaryPassword(id: string): Promise<IssueTempPasswordState> {
  const session = await requireAdminSession();
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  await prisma.user.update({
    where: { id },
    data: {
      passwordHash,
      mustChangePassword: true,
      failedLoginCount: 0,
      lockedUntil: null,
    },
  });

  await recordAdminLog({ actorId: session.user.id, action: "member.password_reset", targetType: "User", targetId: id });
  revalidatePath(`/admin/members/${id}/edit`);
  return { issuedPassword: temporaryPassword };
}
