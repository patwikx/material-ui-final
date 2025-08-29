import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"
import type { UserStatus } from "@prisma/client"
import type { UserAssignment } from "@/next-auth" // 1. IMPORT the UserAssignment type

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
  ...authConfig,
  callbacks: {
    async signIn({ user }) {
      if (!user?.id) return false;
      const existingUser = await prisma.user.findUnique({ where: { id: user.id } });
      return existingUser?.status === 'ACTIVE';
    },

    async jwt({ token }) {
      if (!token.sub) return token;

      const userWithDetails = await prisma.user.findUnique({
        where: { id: token.sub },
        include: {
          assignments: { 
            include: { 
              role: true, 
              businessUnit: true 
            } 
          },
        },
      });

      if (!userWithDetails) return token;

      const leanAssignments = userWithDetails.assignments.map((a) => ({
        businessUnitId: a.businessUnitId,
        roleId: a.roleId,
        businessUnit: { 
          id: a.businessUnit.id, 
          name: a.businessUnit.name,
          displayName: a.businessUnit.displayName  // Add displayName here
        },
        role: { id: a.role.id, name: a.role.name, displayName: a.role.displayName }, 
      }));

      token.id = userWithDetails.id;
      token.firstName = userWithDetails.firstName;
      token.lastName = userWithDetails.lastName;
      token.status = userWithDetails.status;
      token.assignments = leanAssignments;
      
      return token;
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.id as string;
        session.user.name = `${token.firstName} ${token.lastName}`;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.status = token.status as UserStatus;
        // 2. USE the imported type for strong type-safety
        session.user.assignments = token.assignments as UserAssignment[]; 
      }
      return session;
    },
  },
});