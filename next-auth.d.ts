// next-auth.d.ts

import type { UserStatus } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

// Define the structure for a user's role and business unit within an assignment
export interface UserAssignmentRole {
  id: string;
  name: string; // This is the key change: from 'role' to 'name'
  displayName: string;
}

export interface UserAssignmentBusinessUnit {
  id: string;
  name: string;
  displayName: string;
}

// Define the structure of a single assignment
export interface UserAssignment {
  businessUnitId: string;
  roleId: string;
  businessUnit: UserAssignmentBusinessUnit;
  role: UserAssignmentRole;
}

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      status: UserStatus;
      firstName: string;
      lastName: string;
      assignments: UserAssignment[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and sent to the `Session` callback */
  interface JWT {
    id: string;
    status: UserStatus;
    firstName: string;
    lastName: string;
    assignments: UserAssignment[];
  }
}