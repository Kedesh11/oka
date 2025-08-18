import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/server/db/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

const handler = NextAuth({
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
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
