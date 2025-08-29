// In "@/lib/auth-actions/auth-users.ts"

import { prisma } from "../prisma";

/**
 * Fetches a user by their unique username.
 * This function is already correct and requires no changes.
 */
export const getUserByUsername = async (username: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    return user;
  } catch {
    return null;
  }
};

/**
 * UPDATED: Fetches a user by their ID and includes their assignments (roles and business units).
 * The direct `role` relation was removed and replaced with the `assignments` relation.
 */
export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            role: true,
            businessUnit: true,
          },
        },
      },
    });
    return user;
  } catch {
    return null;
  }
};

/**
 * NEW & CORRECTED: Fetches a user's email by their ID.
 * This replaces the old, incorrectly named `getEmailByUserId`.
 */
export const getUserEmailById = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    // Return the email string, or null if not found
    return user?.email ?? null;
  } catch {
    return null;
  }
};

/**
 * NEW & CORRECTED: Fetches a user's full name by their ID.
 * Replaces the part of the old logic that was trying to get a 'name'.
 */
export const getUserFullNameById = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });

    if (!user) {
      return null;
    }
    // Combine firstName and lastName into a full name
    return `${user.firstName} ${user.lastName}`;
  } catch {
    return null;
  }
};


/**
 * RENAMED & CONSOLIDATED: Fetches a user's username by their ID.
 * This replaces the old `getEmailByUserIdUpload` and `getEmailByApproverId` functions.
 */
export const getUsernameById = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });
    return user?.username ?? null;
  } catch {
    return null;
  }
};