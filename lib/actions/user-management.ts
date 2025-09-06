'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { UserStatus } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import { auth } from '@/auth';

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export interface UserData {
  id: string;
  username: string | null;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  assignments: Array<{
    businessUnitId: string;
    roleId: string;
    businessUnit: {
      id: string;
      name: string;
      displayName: string;
    };
    role: {
      id: string;
      name: string;
      displayName: string;
    };
  }>;
}

export interface CreateUserData {
  username: string | null;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  status: UserStatus;
  assignments: Array<{
    businessUnitId: string;
    roleId: string;
  }>;
}

export interface UpdateUserData {
  id: string;
  username: string | null;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash?: string;
  status: UserStatus;
  assignments: Array<{
    businessUnitId: string;
    roleId: string;
  }>;
}

// Helper function to get current user
async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  return session.user;
}

export async function getAllUsers(): Promise<UserData[]> {
  try {
    const users = await prisma.user.findMany({
      include: {
        assignments: {
          include: {
            businessUnit: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
            role: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { firstName: 'asc' },
        { lastName: 'asc' },
      ],
    });

    return users;
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

export async function getUserById(id: string): Promise<UserData | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            businessUnit: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
            role: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

export async function createUser(data: CreateUserData): Promise<ActionResult> {
  try {
    // Get current user for authorization
    await getCurrentUser();

    // Hash the password
    const hashedPassword = await bcryptjs.hash(data.passwordHash, 12);

    await prisma.$transaction(async (tx) => {
      // Create the user
      const createdUser = await tx.user.create({
        data: {
          username: data.username,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          passwordHash: hashedPassword,
          status: data.status,
        },
      });

      // Create assignments
      if (data.assignments.length > 0) {
        await tx.userBusinessUnitRole.createMany({
          data: data.assignments.map(assignment => ({
            userId: createdUser.id,
            businessUnitId: assignment.businessUnitId,
            roleId: assignment.roleId,
          })),
        });
      }
    });

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User created successfully',
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      message: error instanceof Error && error.message === 'User not authenticated'
        ? 'You must be logged in to create a user'
        : 'Failed to create user',
    };
  }
}

export async function updateUser(data: UpdateUserData): Promise<ActionResult> {
  try {
    // Get current user for authorization
    await getCurrentUser();

    await prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: {
        username: string | null;
        email: string;
        firstName: string;
        lastName: string;
        status: UserStatus;
        passwordHash?: string;
        updatedAt: Date;
      } = {
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        status: data.status,
        updatedAt: new Date(),
      };

      // Hash new password if provided
      if (data.passwordHash) {
        updateData.passwordHash = await bcryptjs.hash(data.passwordHash, 12);
      }

      // Update the user
      await tx.user.update({
        where: { id: data.id },
        data: updateData,
      });

      // Remove existing assignments
      await tx.userBusinessUnitRole.deleteMany({
        where: { userId: data.id },
      });

      // Create new assignments
      if (data.assignments.length > 0) {
        await tx.userBusinessUnitRole.createMany({
          data: data.assignments.map(assignment => ({
            userId: data.id,
            businessUnitId: assignment.businessUnitId,
            roleId: assignment.roleId,
          })),
        });
      }
    });

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User updated successfully',
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      success: false,
      message: error instanceof Error && error.message === 'User not authenticated'
        ? 'You must be logged in to update a user'
        : 'Failed to update user',
    };
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    // Get current user for authorization
    await getCurrentUser();

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      success: false,
      message: error instanceof Error && error.message === 'User not authenticated'
        ? 'You must be logged in to delete a user'
        : 'Failed to delete user',
    };
  }
}

export async function toggleUserStatus(id: string, status: UserStatus): Promise<ActionResult> {
  try {
    // Get current user for authorization
    await getCurrentUser();

    await prisma.user.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/users');

    return {
      success: true,
      message: `User ${status.toLowerCase()} successfully`,
    };
  } catch (error) {
    console.error('Error toggling user status:', error);
    return {
      success: false,
      message: error instanceof Error && error.message === 'User not authenticated'
        ? 'You must be logged in to update user status'
        : 'Failed to update user status',
    };
  }
}
