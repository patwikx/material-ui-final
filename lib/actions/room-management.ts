'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { RoomStatus, HousekeepingStatus } from '@prisma/client';



export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export interface RoomData {
  id: string;
  businessUnitId: string;
  roomTypeId: string;
  roomNumber: string;
  floor: number | null;
  wing: string | null;
  status: RoomStatus;
  housekeeping: HousekeepingStatus;
  lastCleaned: Date | null;
  lastInspected: Date | null;
  lastMaintenance: Date | null;
  outOfOrderUntil: Date | null;
  notes: string | null;
  specialFeatures: string[];
  currentRate: string | null;
  lastRateUpdate: Date | null;
  totalRevenue: string;
  monthlyRevenue: string;
  yearlyRevenue: string;
  totalNights: number;
  occupancyRate: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  businessUnit: {
    id: string;
    name: string;
    displayName: string;
  };
  roomType: {
    id: string;
    name: string;
    displayName: string;
    description: string | null;
    type: string;
    baseRate: string;
    // FIX: Added currency to the roomType sub-interface
    currency: string;
  };
}

export interface CreateRoomData {
  businessUnitId: string;
  roomTypeId: string;
  roomNumber: string;
  floor: number | null;
  wing: string | null;
  status: RoomStatus;
  housekeeping: HousekeepingStatus;
  notes: string | null;
  isActive: boolean;
  outOfOrderUntil: Date | null;
}

export interface UpdateRoomData extends CreateRoomData {
  id: string;
}

export async function getAllRooms(businessUnitId?: string): Promise<RoomData[]> {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        ...(businessUnitId && { businessUnitId }),
      },
      include: {
        businessUnit: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        roomType: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            type: true,
            baseRate: true,
            // FIX: Include the room rates to get the currency
            rates: {
              where: { isActive: true },
              select: { currency: true },
              take: 1,
            },
          },
        },
      },
      orderBy: [
        { businessUnitId: 'asc' },
        { floor: 'asc' },
        { roomNumber: 'asc' },
      ],
    });

    return rooms.map(room => ({
      ...room,
      currentRate: room.currentRate?.toString() ?? null,
      totalRevenue: room.totalRevenue.toString(),
      monthlyRevenue: room.monthlyRevenue.toString(),
      yearlyRevenue: room.yearlyRevenue.toString(),
      occupancyRate: room.occupancyRate?.toString() ?? null,
      roomType: {
        ...room.roomType,
        baseRate: room.roomType.baseRate.toString(),
        // FIX: Map the currency from the fetched rates
        currency: room.roomType.rates[0]?.currency || 'PHP',
      },
    }));
  } catch (error) {
    console.error('Error fetching all rooms:', error);
    return [];
  }
}

export async function getRoomById(id: string): Promise<RoomData | null> {
  try {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        businessUnit: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        roomType: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            type: true,
            baseRate: true,
            // FIX: Include the room rates to get the currency
            rates: {
              where: { isActive: true },
              select: { currency: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!room) return null;

    return {
      ...room,
      currentRate: room.currentRate?.toString() ?? null,
      totalRevenue: room.totalRevenue.toString(),
      monthlyRevenue: room.monthlyRevenue.toString(),
      yearlyRevenue: room.yearlyRevenue.toString(),
      occupancyRate: room.occupancyRate?.toString() ?? null,
      roomType: {
        ...room.roomType,
        baseRate: room.roomType.baseRate.toString(),
        // FIX: Map the currency from the fetched rates
        currency: room.roomType.rates[0]?.currency || 'PHP',
      },
    };
  } catch (error) {
    console.error('Error fetching room by ID:', error);
    return null;
  }
}

export async function createRoom(data: CreateRoomData): Promise<ActionResult> {
  try {
    await prisma.room.create({
      data: {
        ...data,
        housekeeping: HousekeepingStatus.CLEAN, // Default value from schema
      },
    });

    revalidatePath('/admin/operations/rooms');

    return {
      success: true,
      message: 'Room created successfully'
    };
  } catch (error) {
    console.error('Error creating room:', error);
    return {
      success: false,
      message: 'Failed to create room'
    };
  }
}

export async function updateRoom(data: UpdateRoomData): Promise<ActionResult> {
  try {
    const { id, ...updateData } = data;
    await prisma.room.update({
      where: { id },
      data: {
        ...updateData,
        housekeeping: data.housekeeping, // FIX: Use housekeeping from data, not hardcoded
        updatedAt: new Date(),
      }
    });

    revalidatePath('/admin/operations/rooms');

    return {
      success: true,
      message: 'Room updated successfully'
    };
  } catch (error) {
    console.error('Error updating room:', error);
    return {
      success: false,
      message: 'Failed to update room'
    };
  }
}

export async function deleteRoom(id: string): Promise<ActionResult> {
  try {
    await prisma.room.delete({
      where: { id }
    });

    revalidatePath('/admin/operations/rooms');

    return {
      success: true,
      message: 'Room deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting room:', error);
    return {
      success: false,
      message: 'Failed to delete room'
    };
  }
}

export async function updateRoomStatus(id: string, status: RoomStatus): Promise<ActionResult> {
  try {
    await prisma.room.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date()
      }
    });

    revalidatePath('/admin/operations/rooms');

    return {
      success: true,
      message: `Room status updated to ${status.toLowerCase()}`
    };
  } catch (error) {
    console.error('Error updating room status:', error);
    return {
      success: false,
      message: 'Failed to update room status'
    };
  }
}

export async function toggleRoomStatus(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    await prisma.room.update({
      where: { id },
      data: {
        isActive,
        updatedAt: new Date()
      }
    });

    revalidatePath('/admin/operations/rooms');

    return {
      success: true,
      message: `Room ${isActive ? 'activated' : 'deactivated'} successfully`
    };
  } catch (error) {
    console.error('Error toggling room status:', error);
    return {
      success: false,
      message: 'Failed to update room status'
    };
  }
}