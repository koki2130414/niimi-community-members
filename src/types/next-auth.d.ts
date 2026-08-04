import { MembershipPlan, MemberStatus } from "@/lib/permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      displayName: string;
      membershipPlan: MembershipPlan;
      status: MemberStatus;
      mustChangePassword: boolean;
    };
  }
}
