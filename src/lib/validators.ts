import { z } from "zod";

// 入力値検証（SQLインジェクション対策はPrisma利用で担保、ここでは型・形式・不正値を検証しXSS/不正入力を防ぐ）

export const loginSchema = z.object({
  loginIdOrEmail: z.string().min(1, "ログインIDまたはメールアドレスを入力してください").max(255),
  password: z.string().min(1, "パスワードを入力してください").max(255),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
    newPassword: z
      .string()
      .min(8, "パスワードは8文字以上で入力してください")
      .max(100)
      .regex(/[A-Za-z]/, "パスワードには英字を含めてください")
      .regex(/[0-9]/, "パスワードには数字を含めてください"),
    newPasswordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "新しいパスワードが一致しません",
    path: ["newPasswordConfirm"],
  });

export const memberCreateSchema = z.object({
  name: z.string().min(1, "氏名を入力してください").max(100),
  displayName: z.string().min(1, "表示名を入力してください").max(50),
  email: z.string().email("正しいメールアドレスを入力してください").max(255),
  loginId: z
    .string()
    .min(4, "ログインIDは4文字以上で入力してください")
    .max(50)
    .regex(/^[a-zA-Z0-9_.-]+$/, "ログインIDは半角英数字と - _ . のみ使用できます"),
  membershipPlan: z.enum(["FREE", "STANDARD", "PREMIUM", "ADMIN"]),
  expiresAt: z.string().optional().nullable(),
  adminNote: z.string().max(2000).optional(),
});

export const memberUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  displayName: z.string().min(1).max(50).optional(),
  email: z.string().email().max(255).optional(),
  membershipPlan: z.enum(["FREE", "STANDARD", "PREMIUM", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "WITHDRAWN", "EXPIRED"]).optional(),
  expiresAt: z.string().optional().nullable(),
  adminNote: z.string().max(2000).optional(),
});

export const videoUpsertSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください").max(200),
  youtubeUrl: z.string().url("正しいYouTube URLを入力してください"),
  description: z.string().max(5000).optional(),
  categoryId: z.string().optional().nullable(),
  tags: z.string().max(500).optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  allowedPlans: z.array(z.enum(["FREE", "STANDARD", "PREMIUM", "ADMIN"])).min(1, "対象会員種別を1つ以上選択してください"),
});

export const articleUpsertSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください").max(200),
  summary: z.string().max(500).optional(),
  bodyHtml: z.string().min(1, "本文を入力してください"),
  categoryId: z.string().optional().nullable(),
  tags: z.string().max(500).optional(),
  authorName: z.string().max(100).optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  allowedPlans: z.array(z.enum(["FREE", "STANDARD", "PREMIUM", "ADMIN"])).min(1, "対象会員種別を1つ以上選択してください"),
});

/** YouTube URL から動画IDを抽出する（不正な値の混入を防ぐためサーバー側で再計算する） */
export function extractYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      const match = parsed.pathname.match(/\/embed\/([^/?]+)/);
      if (match) return match[1];
    }
    return null;
  } catch {
    return null;
  }
}
