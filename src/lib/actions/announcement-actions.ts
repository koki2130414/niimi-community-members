"use server";

import { prisma } from "@/lib/db";
import { requireMemberSession } from "@/lib/auth-helpers";
import { canViewContent } from "@/lib/permissions";

export async function markAnnouncementRead(announcementId: string) {
  const session = await requireMemberSession();
  const announcement = await prisma.announcement.findUnique({ where: { id: announcementId } });
  if (!announcement || announcement.deletedAt || !announcement.isPublished) return;
  if (!canViewContent(session.user.membershipPlan, announcement.allowedPlans)) return;

  await prisma.announcementRead.upsert({
    where: { userId_announcementId: { userId: session.user.id, announcementId } },
    update: {},
    create: { userId: session.user.id, announcementId },
  });
}
