import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@digicolony/db";
import type { UserPermission } from "@digicolony/shared";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "CLIENT_USER";
      clientId?: string | null;
      permissions: UserPermission[];
      mustChangePassword: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "ADMIN" | "CLIENT_USER";
    clientId?: string | null;
    permissions?: UserPermission[];
    mustChangePassword?: boolean;
  }
}

type LaunchJwtFields = {
  role?: "ADMIN" | "CLIENT_USER";
  clientId?: string | null;
  permissions?: UserPermission[];
  mustChangePassword?: boolean;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "production"
      ? undefined
      : "local-development-secret-change-before-production"),
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Local database credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.toLowerCase().trim()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { passwordCredential: true },
        });

        if (!user?.passwordCredential) {
          return null;
        }

        const passwordMatches = await compare(
          password,
          user.passwordCredential.passwordHash,
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          clientId: user.clientId,
          permissions: user.permissions,
          mustChangePassword: user.passwordCredential.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const launchToken = token as typeof token & LaunchJwtFields;

      if (user) {
        launchToken.role = user.role;
        launchToken.clientId = user.clientId;
        launchToken.permissions = user.permissions ?? [];
        launchToken.mustChangePassword = user.mustChangePassword;
      } else if (token.sub) {
        const currentUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            clientId: true,
            permissions: true,
            role: true
          }
        });

        if (currentUser) {
          launchToken.role = currentUser.role;
          launchToken.clientId = currentUser.clientId;
          launchToken.permissions = currentUser.permissions;
        }
      }

      return launchToken;
    },
    session({ session, token }) {
      const launchToken = token as typeof token & LaunchJwtFields;

      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = launchToken.role ?? "CLIENT_USER";
        session.user.clientId = launchToken.clientId;
        session.user.permissions = launchToken.permissions ?? [];
        session.user.mustChangePassword =
          launchToken.mustChangePassword ?? false;
      }

      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
});
