"use server";

import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth-helpers";
import { serializeAllowedPlans, type MembershipPlan } from "@/lib/permissions";
import { recordAdminLog } from "@/lib/admin-log";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "materials");
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
// 実行可能ファイル等、資料としてふさわしくない拡張子を拒否する（不正なファイルアップロード対策）
const BLOCKED_EXTENSIONS = [".exe", ".sh", ".bat", ".cmd", ".php", ".js", ".html", ".htm", ".svg"];

const metaSchema = z.object({
  title: z.string().min(1, "資料名を入力してください").max(200),
  description: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  isPublished: z.boolean(),
  allowedPlans: z.array(z.enum(["FREE", "STANDARD", "PREMIUM", "ADMIN"])).min(1),
});

export type MaterialFormState = { error?: string };

export async function createMaterial(_prev: MaterialFormState, formData: FormData): Promise<MaterialFormState> {
  const session = await requireAdminSession();

  const parsed = metaSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category") || undefined,
    isPublished: formData.get("isPublished") === "on",
    allowedPlans: formData.getAll("allowedPlans") as MembershipPlan[],
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "入力内容を確認してください" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "アップロードするファイルを選択してください" };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { error: "ファイルサイズが大きすぎます（上限20MB）" };
  }
  const ext = path.extname(file.name).toLowerCase();
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return { error: "このファイル形式はアップロードできません" };
  }

  // 推測されにくいランダムなファイル名で保存する（元のファイル名は表示用にDBへ保持）
  const storageKey = `${crypto.randomUUID()}${ext}`;
  await fs.mkdir(STORAGE_ROOT, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(STORAGE_ROOT, storageKey), buffer);

  const material = await prisma.downloadMaterial.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      fileStorageKey: storageKey,
      fileName: file.name,
      isPublished: parsed.data.isPublished,
      allowedPlans: serializeAllowedPlans(parsed.data.allowedPlans),
      publishedAt: parsed.data.isPublished ? new Date() : null,
    },
  });

  await recordAdminLog({ actorId: session.user.id, action: "material.create", targetType: "DownloadMaterial", targetId: material.id });
  revalidatePath("/admin/materials");
  return {};
}

export async function deleteMaterial(id: string) {
  const session = await requireAdminSession();
  await prisma.downloadMaterial.update({ where: { id }, data: { deletedAt: new Date(), isPublished: false } });
  await recordAdminLog({ actorId: session.user.id, action: "material.delete", targetType: "DownloadMaterial", targetId: id });
  revalidatePath("/admin/materials");
}
