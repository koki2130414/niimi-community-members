"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const RESET_TOKEN_TTL_MINUTES = 60;

const requestSchema = z.object({
  loginIdOrEmail: z.string().min(1),
});

export type ResetRequestState = { message?: string; devResetUrl?: string };

/**
 * パスワード再設定リクエスト。
 *
 * 注意: MVPではメール送信基盤(SES/SendGrid等)を未接続のため、
 * 開発環境では再設定用URLを画面に直接表示する。
 * 本番運用時は必ずメール送信に置き換え、URLを画面に表示しないこと。
 */
export async function requestPasswordReset(
  _prev: ResetRequestState,
  formData: FormData
): Promise<ResetRequestState> {
  const parsed = requestSchema.safeParse({ loginIdOrEmail: formData.get("loginIdOrEmail") });
  if (!parsed.success) {
    return { message: "ログインIDまたはメールアドレスを入力してください" };
  }

  const user = await prisma.user.findFirst({
    where: {
      deletedAt: null,
      OR: [{ loginId: parsed.data.loginIdOrEmail }, { email: parsed.data.loginIdOrEmail }],
    },
  });

  // アカウントの存在有無を外部から推測されないよう、常に同じメッセージを返す
  const genericMessage = "ご登録の情報が確認できた場合、パスワード再設定用のご案内をお送りしました。";

  if (!user) {
    return { message: genericMessage };
  }

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      mustResetToken: token,
      mustResetTokenExpiry: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000),
    },
  });

  const resetUrl = `/reset-password/${token}`;

  if (process.env.NODE_ENV !== "production") {
    // 開発環境のみ: メール送信の代わりにURLを画面表示する
    return { message: genericMessage, devResetUrl: resetUrl };
  }

  // TODO(本番実装時): ここでメール送信サービスを呼び出し、resetUrlを送信する
  return { message: genericMessage };
}

const confirmSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z
      .string()
      .min(8, "パスワードは8文字以上で入力してください")
      .regex(/[A-Za-z]/, "パスワードには英字を含めてください")
      .regex(/[0-9]/, "パスワードには数字を含めてください"),
    newPasswordConfirm: z.string(),
  })
  .refine((d) => d.newPassword === d.newPasswordConfirm, {
    message: "パスワードが一致しません",
    path: ["newPasswordConfirm"],
  });

export type ResetConfirmState = { error?: string; success?: boolean };

export async function confirmPasswordReset(
  _prev: ResetConfirmState,
  formData: FormData
): Promise<ResetConfirmState> {
  const parsed = confirmSchema.safeParse({
    token: formData.get("token"),
    newPassword: formData.get("newPassword"),
    newPasswordConfirm: formData.get("newPasswordConfirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "入力内容を確認してください" };
  }

  const user = await prisma.user.findUnique({ where: { mustResetToken: parsed.data.token } });
  if (!user || !user.mustResetTokenExpiry || user.mustResetTokenExpiry.getTime() < Date.now()) {
    return { error: "リンクの有効期限が切れています。再度パスワード再設定をリクエストしてください" };
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newHash,
      mustResetToken: null,
      mustResetTokenExpiry: null,
      mustChangePassword: false,
      failedLoginCount: 0,
      lockedUntil: null,
    },
  });

  return { success: true };
}
