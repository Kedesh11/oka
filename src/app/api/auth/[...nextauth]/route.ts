import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/server/db/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, email: true, password: true, role: true, agenceId: true, status: true, name: true },
        });
        if (!user) return null;
        if (user.status !== "active") return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        // Met à jour la dernière connexion
        try {
          await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
        } catch (e) {
          console.warn("[auth] Échec mise à jour lastLogin:", e);
        }
        return { id: String(user.id), email: user.email, role: user.role, agenceId: user.agenceId, name: user.name } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On première connexion (login), propager role/agenceId
      if (user) {
        token.role = (user as any).role || token.role;
        token.agenceId = (user as any).agenceId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role || (session.user as any).role;
        (session.user as any).agenceId = token.agenceId ?? null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirection sécurisée: autorise uniquement les URLs de même origine
      try {
        const fullBase = baseUrl;
        const target = url.startsWith("/") ? new URL(url, fullBase).toString() : url;
        if (new URL(target).origin === new URL(fullBase).origin && !url.includes("/api/auth")) {
          return target;
        }
        return fullBase;
      } catch {
        return baseUrl;
      }
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
