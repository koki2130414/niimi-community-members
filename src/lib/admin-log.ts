import { prisma } from "@/lib/db";

/** 管理者の重要操作を管理ログに記録する */
export async function recordAdminLog(params: {
  actorId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  detail?: Record<string, unknown>;
}) {
  await prisma.adminLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      detail: params.detail ? JSON.stringify(params.detail) : undefined,
    },
  });
}
