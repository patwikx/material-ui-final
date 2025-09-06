'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export interface RoleData {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    assignments: number;
  };
}

export interface CreateRoleData {
  name: string;
  displayName: string;
  description: string | null;
}

export interface UpdateRoleData extends CreateRoleData {
  id: string;
}

// Helper function to get current user
async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  return session.user;
}

export async function getAllRoles(): Promise<RoleData[]> {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            assignments: true,
          },
        },
      },
      orderBy: [
        { name: 'asc' },
      ],
    });

    return roles;
  } catch (error) {
    console.error('Error fetching all roles:', error);
    return [];
  }
}

export async function getRoleById(id: string): Promise<RoleData | null> {
  try {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            assignments: true,
          },
        },
      },
    });

    return role;
  } catch (error) {
    console.error('Error fetching role by ID:', error);
    return null;
  }
}

export async function createRole(data: CreateRoleData): Promise<ActionResult> {
  try {
    // Get current user for authorization
    await getCurrentUser();

    await prisma.role.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
      },
    });

    revalidatePath('/admin/roles');

    return {
      success: true,
      message: 'Role created successfully',
    };
  } catch (error) {
    console.error('Error creating role:', error);
    return {
      success: false,
      message: error instanceof Error && error.message === 'User not authenticated'
        ? 'You must be logged in to create a role'
        : 'Failed to create role',
    };
  }
}

export async function updateRole(data: UpdateRoleData): Promise<ActionResult> {
  try {
    // Get current user for authorization
    await getCurrentUser();

    await prisma.role.update({
      where: { id: data.id },
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/roles');

    return {
      success: true,
      message: 'Role updated successfully',
    };
  } catch (error) {
    console.error('Error updating role:', error);
    return {
      success: false,
      message: error instanceof Error && error.message === 'User not authenticated'
        ? 'You must be logged in to update a role'
        : 'Failed to update role',
    };
  }
}

export async function deleteRole(id: string): Promise<ActionResult> {
  try {
    // Get current user for authorization
    await getCurrentUser();

    // Check if role has any assignments
    const assignmentCount = await prisma.userBusinessUnitRole.count({
      where: { roleId: id },
    });

    if (assignmentCount > 0) {
      return {
        success: false,
        message: 'Cannot delete role with existing user assignments. Please reassign users first.',
      };
    }

    await prisma.role.delete({
      where: { id },
    });

    revalidatePath('/admin/roles');

    return {
      success: true,
      message: 'Role deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting role:', error);
    return {
      success: false,
      message: error instanceof Error && error.message === 'User not authenticated'
        ? 'You must be logged in to delete a role'
        : 'Failed to delete role',
    };
  }
}
