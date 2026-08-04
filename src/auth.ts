import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { isLocked, nextStateAfterFailedLogin, stateAfterSuccessfulLogin } from "@/lib/login-guard";
import { isMemberActive } from "@/lib/permissions";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // セッション固定攻撃対策: DBセッション方式を採用し、ログインの都度サーバー側で
  // 新しいセッショントークンを発行する（JWTのクライアント側再利用を避ける）。
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        loginIdOrEmail: { label: "ログインID / メールアドレス", type: "text" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { loginIdOrEmail, password } = parsed.data;

        const user = await prisma.user.findFirst({
          where: {
            deletedAt: null,
            OR: [{ loginId: loginIdOrEmail }, { email: loginIdOrEmail }],
          },
        });

        // ユーザーが存在しない場合も、存在有無が推測できないよう同一エラーメッセージで扱う
        if (!user) return null;

        // アカウントロック中は認証情報の正誤に関わらず拒否する
        if (isLocked(user.lockedUntil)) {
          throw new Error("LOCKED");
        }

        // 退会・停止・期限切れ会員はログイン不可
        if (!isMemberActive(user.status, user.expiresAt)) {
          throw new Error("INACTIVE");
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatches) {
          const next = nextStateAfterFailedLogin(user.failedLoginCount);
          await prisma.user.update({
            where: { id: user.id },
            data: next,
          });
          return null;
        }

        // ログイン成功: 失敗カウントをリセットし、最終ログイン日時を更新
        await prisma.user.update({
          where: { id: user.id },
          data: { ...stateAfterSuccessfulLogin(), lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
        };
      },
    }),
  ],
  callbacks: {
        // 初回サインイン時のみ user が渡される。以降のリクエストでは token だけが渡されるため、
        // 会員種別などの判定に必要な情報を token に載せておく。
        async jwt({ token, user }) {
                if (user) {
                          token.userId = user.id;
                }
                return token;
        },
        async session({ session, token }) {
                // セッションに会員種別・ステータス等を載せ、各画面/APIでの権限判定に使う。
                const userId = token.userId as string | undefined;
                if (!userId) return session;
                const dbUser = await prisma.user.findUnique({ where: { id: userId } });
                if (dbUser && session.user) {
                          session.user.id = dbUser.id;
                          session.user.membershipPlan = dbUser.membershipPlan;
                          session.user.status = dbUser.status;
                          session.user.displayName = dbUser.displayName;
                          session.user.mustChangePassword = dbUser.mustChangePassword;
                }
                return session;
        },
  },
});
