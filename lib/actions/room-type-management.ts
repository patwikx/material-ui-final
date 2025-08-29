'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { Decimal } from '@prisma/client/runtime/library';
import { RoomType } from '@prisma/client';

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

// FIX: Added 'currency' and 'amenities' to the interface
export interface RoomTypeData {
  id: string;
  businessUnitId: string;
  name: string;
  displayName: string;
  description: string | null;
  type: RoomType;
  maxOccupancy: number;
  maxAdults: number;
  maxChildren: number;
  maxInfants: number;
  bedConfiguration: string | null;
  roomSize: number | null;
  hasBalcony: boolean;
  hasOceanView: boolean;
  hasPoolView: boolean;
  hasKitchenette: boolean;
  hasLivingArea: boolean;
  smokingAllowed: boolean;
  petFriendly: boolean;
  isAccessible: boolean;
  baseRate: string; // Converted from Decimal
  extraPersonRate: string | null;
  extraChildRate: string | null;
  floorPlan: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  businessUnit: {
    id: string;
    name: string;
    displayName: string;
  };
  _count: {
    rooms: number;
  };
  // FIX: Added currency and amenities fields
  currency: string;
  amenities: string[];
}

export interface CreateRoomTypeData {
  name: string;
  displayName: string;
  description: string | null;
  type: RoomType;
  baseRate: number;
  maxOccupancy: number;
  maxAdults: number;
  maxChildren: number;
  maxInfants: number;
  bedConfiguration: string | null;
  roomSize: number | null;
  hasBalcony: boolean;
  hasOceanView: boolean;
  hasPoolView: boolean;
  hasKitchenette: boolean;
  hasLivingArea: boolean;
  smokingAllowed: boolean;
  petFriendly: boolean;
  isAccessible: boolean;
  extraPersonRate: number | null;
  extraChildRate: number | null;
  floorPlan: string | null;
  isActive: boolean;
  sortOrder: number;
  businessUnitId: string;
  // FIX: Added amenities field for creation
  amenityIds?: string[];
}

export interface UpdateRoomTypeData extends CreateRoomTypeData {
  id: string;
}

export async function getRoomTypes(businessUnitId?: string): Promise<RoomTypeData[]> {
  try {
    const roomTypes = await prisma.roomType_Model.findMany({
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
        _count: {
          select: {
            rooms: true,
          },
        },
        // FIX: Included amenities and rates for display
        amenities: {
          include: {
            amenity: {
              select: {
                name: true,
              },
            },
          },
        },
        rates: {
          where: {
            isActive: true,
          },
          select: {
            currency: true,
          },
          take: 1,
        },
      },
      orderBy: [
        { businessUnitId: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    return roomTypes.map(roomType => ({
      ...roomType,
      baseRate: roomType.baseRate.toString(),
      extraPersonRate: roomType.extraPersonRate?.toString() ?? null,
      extraChildRate: roomType.extraChildRate?.toString() ?? null,
      roomSize: roomType.roomSize?.toNumber() ?? null,
      type: roomType.type as RoomTypeData['type'],
      // FIX: Map currency and amenities from the included relations
      currency: roomType.rates[0]?.currency || 'PHP',
      amenities: roomType.amenities.map(a => a.amenity.name),
    }));
  } catch (error) {
    console.error('Error fetching room types:', error);
    return [];
  }
}

export async function getRoomTypeById(id: string): Promise<RoomTypeData | null> {
  try {
    const roomType = await prisma.roomType_Model.findUnique({
      where: { id },
      include: {
        businessUnit: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
        // FIX: Included amenities and rates for display
        amenities: {
          include: {
            amenity: {
              select: {
                name: true,
              },
            },
          },
        },
        rates: {
          where: {
            isActive: true,
          },
          select: {
            currency: true,
          },
          take: 1,
        },
      },
    });

    if (!roomType) return null;

    return {
      ...roomType,
      baseRate: roomType.baseRate.toString(),
      extraPersonRate: roomType.extraPersonRate?.toString() ?? null,
      extraChildRate: roomType.extraChildRate?.toString() ?? null,
      roomSize: roomType.roomSize?.toNumber() ?? null,
      type: roomType.type as RoomTypeData['type'],
      // FIX: Map currency and amenities from the included relations
      currency: roomType.rates[0]?.currency || 'PHP',
      amenities: roomType.amenities.map(a => a.amenity.name),
    };
  } catch (error) {
    console.error('Error fetching room type by ID:', error);
    return null;
  }
}

export async function createRoomType(data: CreateRoomTypeData): Promise<ActionResult> {
  try {
    const { amenityIds, ...roomTypeData } = data;
    await prisma.roomType_Model.create({
      data: {
        ...roomTypeData,
        baseRate: new Decimal(roomTypeData.baseRate),
        roomSize: roomTypeData.roomSize,
        extraPersonRate: roomTypeData.extraPersonRate,
        extraChildRate: roomTypeData.extraChildRate,
        amenities: {
          create: amenityIds?.map(amenityId => ({
            amenityId,
          })),
        },
      },
    });

    revalidatePath('/admin/operations/room-types');

    return {
      success: true,
      message: 'Room type created successfully'
    };
  } catch (error) {
    console.error('Error creating room type:', error);
    return {
      success: false,
      message: 'Failed to create room type'
    };
  }
}

export async function updateRoomType(data: UpdateRoomTypeData): Promise<ActionResult> {
  try {
    const { id, amenityIds, ...roomTypeData } = data;
    await prisma.roomType_Model.update({
      where: { id: id },
      data: {
        ...roomTypeData,
        baseRate: new Decimal(roomTypeData.baseRate),
        roomSize: roomTypeData.roomSize,
        extraPersonRate: roomTypeData.extraPersonRate,
        extraChildRate: roomTypeData.extraChildRate,
        amenities: {
          deleteMany: {}, // Clear existing amenities
          create: amenityIds?.map(amenityId => ({
            amenityId,
          })),
        },
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/operations/room-types');

    return {
      success: true,
      message: 'Room type updated successfully'
    };
  } catch (error) {
    console.error('Error updating room type:', error);
    return {
      success: false,
      message: 'Failed to update room type'
    };
  }
}

export async function deleteRoomType(id: string): Promise<ActionResult> {
  try {
    await prisma.roomType_Model.delete({
      where: { id }
    });

    revalidatePath('/admin/operations/room-types');

    return {
      success: true,
      message: 'Room type deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting room type:', error);
    return {
      success: false,
      message: 'Failed to delete room type'
    };
  }
}

export async function toggleRoomTypeStatus(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    await prisma.roomType_Model.update({
      where: { id },
      data: { 
        isActive,
        updatedAt: new Date()
      }
    });

    revalidatePath('/admin/operations/room-types');

    return {
      success: true,
      message: `Room type ${isActive ? 'activated' : 'deactivated'} successfully`
    };
  } catch (error) {
    console.error('Error toggling room type status:', error);
    return {
      success: false,
      message: 'Failed to update room type status'
    };
  }
}