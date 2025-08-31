/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { Decimal } from '@prisma/client/runtime/library';
import { auth } from '@/auth';

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export interface RoomRateData {
  id: string;
  roomTypeId: string;
  name: string;
  description: string | null;
  baseRate: string;
  currency: string;
  validFrom: Date | null;
  validTo: Date | null;
  isActive: boolean;
  isDefault: boolean;
  minStay: number;
  maxStay: number | null;
  minAdvance: number | null;
  maxAdvance: number | null;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  createdAt: Date;
  updatedAt: Date;
  roomType: {
    id: string;
    name: string;
    displayName: string;
    businessUnit: {
      id: string;
      name: string;
      displayName: string;
    };
  };
}

export interface CreateRoomRateData {
  roomTypeId: string;
  name: string;
  description: string | null;
  baseRate: number;
  currency: string;
  validFrom: Date | null;
  validTo: Date | null;
  isActive: boolean;
  isDefault: boolean;
  minStay: number;
  maxStay: number | null;
  minAdvance: number | null;
  maxAdvance: number | null;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface UpdateRoomRateData extends CreateRoomRateData {
  id: string;
}

async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  return session.user;
}

export async function getAllRoomRates(businessUnitId?: string): Promise<RoomRateData[]> {
  try {
    const roomRates = await prisma.roomRate.findMany({
      where: {
        ...(businessUnitId && {
          roomType: {
            businessUnitId: businessUnitId,
          },
        }),
      },
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            displayName: true,
            businessUnit: {
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
        { roomType: { businessUnitId: 'asc' } },
        { isDefault: 'desc' },
        { validFrom: 'desc' },
        { name: 'asc' },
      ],
    });

    return roomRates.map(rate => ({
      id: rate.id,
      roomTypeId: rate.roomTypeId,
      name: rate.name,
      description: rate.description,
      baseRate: rate.baseRate.toString(),
      currency: rate.currency,
      validFrom: rate.validFrom,
      validTo: rate.validTo,
      isActive: rate.isActive,
      isDefault: rate.isDefault,
      minStay: rate.minStay,
      maxStay: rate.maxStay,
      minAdvance: rate.minAdvance,
      maxAdvance: rate.maxAdvance,
      monday: rate.monday,
      tuesday: rate.tuesday,
      wednesday: rate.wednesday,
      thursday: rate.thursday,
      friday: rate.friday,
      saturday: rate.saturday,
      sunday: rate.sunday,
      createdAt: rate.createdAt,
      updatedAt: rate.updatedAt,
      roomType: rate.roomType,
      // Convert any additional Decimal fields if they exist
      ...(rate.extraPersonRate && { extraPersonRate: rate.extraPersonRate.toString() }),
      ...(rate.childRate && { childRate: rate.childRate.toString() }),
    }));
  } catch (error) {
    console.error('Error fetching all room rates:', error);
    return [];
  }
}

export async function getRoomRateById(id: string): Promise<RoomRateData | null> {
  try {
    const roomRate = await prisma.roomRate.findUnique({
      where: { id },
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            displayName: true,
            businessUnit: {
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

    if (!roomRate) return null;

    return {
      id: roomRate.id,
      roomTypeId: roomRate.roomTypeId,
      name: roomRate.name,
      description: roomRate.description,
      baseRate: roomRate.baseRate.toString(),
      currency: roomRate.currency,
      validFrom: roomRate.validFrom,
      validTo: roomRate.validTo,
      isActive: roomRate.isActive,
      isDefault: roomRate.isDefault,
      minStay: roomRate.minStay,
      maxStay: roomRate.maxStay,
      minAdvance: roomRate.minAdvance,
      maxAdvance: roomRate.maxAdvance,
      monday: roomRate.monday,
      tuesday: roomRate.tuesday,
      wednesday: roomRate.wednesday,
      thursday: roomRate.thursday,
      friday: roomRate.friday,
      saturday: roomRate.saturday,
      sunday: roomRate.sunday,
      createdAt: roomRate.createdAt,
      updatedAt: roomRate.updatedAt,
      roomType: roomRate.roomType,
    };
  } catch (error) {
    console.error('Error fetching room rate by ID:', error);
    return null;
  }
}

export async function createRoomRate(data: CreateRoomRateData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    await prisma.roomRate.create({
      data: {
        roomTypeId: data.roomTypeId,
        name: data.name,
        description: data.description,
        baseRate: new Decimal(data.baseRate),
        currency: data.currency,
        validFrom: data.validFrom,
        validTo: data.validTo,
        isActive: data.isActive,
        isDefault: data.isDefault,
        minStay: data.minStay,
        maxStay: data.maxStay,
        minAdvance: data.minAdvance,
        maxAdvance: data.maxAdvance,
        monday: data.monday,
        tuesday: data.tuesday,
        wednesday: data.wednesday,
        thursday: data.thursday,
        friday: data.friday,
        saturday: data.saturday,
        sunday: data.sunday,
      },
    });

    revalidatePath('/admin/operations/room-rates');

    return {
      success: true,
      message: 'Room rate created successfully',
    };
  } catch (error) {
    console.error('Error creating room rate:', error);
    return {
      success: false,
      message: error instanceof Error && error.message === 'User not authenticated'
        ? 'You must be logged in to create a room rate'
        : 'Failed to create room rate',
    };
  }
}

export async function updateRoomRate(data: UpdateRoomRateData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    const { id, ...updateData } = data;

    await prisma.roomRate.update({
      where: { id },
      data: {
        name: updateData.name,
        description: updateData.description,
        baseRate: new Decimal(updateData.baseRate),
        currency: updateData.currency,
        validFrom: updateData.validFrom,
        validTo: updateData.validTo,
        isActive: updateData.isActive,
        isDefault: updateData.isDefault,
        minStay: updateData.minStay,
        maxStay: updateData.maxStay,
        minAdvance: updateData.minAdvance,
        maxAdvance: updateData.maxAdvance,
        monday: updateData.monday,
        tuesday: updateData.tuesday,
        wednesday: updateData.wednesday,
        thursday: updateData.thursday,
        friday: updateData.friday,
        saturday: updateData.saturday,
        sunday: updateData.sunday,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/operations/room-rates');

    return {
      success: true,
      message: 'Room rate updated successfully',
    };
  } catch (error) {
    console.error('Error updating room rate:', error);
    return {
      success: false,
      message: error instanceof Error && error.message === 'User not authenticated'
        ? 'You must be logged in to update a room rate'
        : 'Failed to update room rate',
    };
  }
}

export async function deleteRoomRate(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    await prisma.roomRate.delete({
      where: { id },
    });

    revalidatePath('/admin/operations/room-rates');

    return {
      success: true,
      message: 'Room rate deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting room rate:', error);
    return {
      success: false,
      message: error instanceof Error && error.message === 'User not authenticated'
        ? 'You must be logged in to delete a room rate'
        : 'Failed to delete room rate',
    };
  }
}

export async function toggleRoomRateStatus(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    await prisma.roomRate.update({
      where: { id },
      data: {
        isActive,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/operations/room-rates');

    return {
      success: true,
      message: `Room rate ${isActive ? 'activated' : 'deactivated'} successfully`,
    };
  } catch (error) {
    console.error('Error toggling room rate status:', error);
    return {
      success: false,
      message: error instanceof Error && error.message === 'User not authenticated'
        ? 'You must be logged in to update room rate status'
        : 'Failed to update room rate status',
    };
  }
}

export async function setDefaultRoomRate(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    const roomRate = await prisma.roomRate.findUnique({
      where: { id },
      select: { roomTypeId: true },
    });

    if (!roomRate) {
      return {
        success: false,
        message: 'Room rate not found',
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.roomRate.updateMany({
        where: {
          roomTypeId: roomRate.roomTypeId,
          isDefault: true,
        },
        data: {
          isDefault: false,
          updatedAt: new Date(),
        },
      });

      await tx.roomRate.update({
        where: { id },
        data: {
          isDefault: true,
          updatedAt: new Date(),
        },
      });
    });

    revalidatePath('/admin/operations/room-rates');

    return {
      success: true,
      message: 'Default room rate updated successfully',
    };
  } catch (error) {
    console.error('Error setting default room rate:', error);
    return {
      success: false,
      message: error instanceof Error && error.message === 'User not authenticated'
        ? 'You must be logged in to set default room rate'
        : 'Failed to set default room rate',
    };
  }
}