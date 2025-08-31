'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { RoomStatus, HousekeepingStatus, ImageCategory, RoomType } from '@prisma/client';
import { auth } from '@/auth';

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
    currency: string;
  };
  images: {
    id: string;
    roomId: string;
    imageId: string;
    context: string | null;
    isPrimary: boolean;
    sortOrder: number;
    createdAt: Date;
    image: {
      id: string;
      originalUrl: string;
      thumbnailUrl: string | null;
      mediumUrl: string | null;
      largeUrl: string | null;
      title: string | null;
      description: string | null;
      altText: string | null;
      caption: string | null;
    };
  }[];
}

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
  baseRate: string;
  extraPersonRate: string | null;
  extraChildRate: string | null;
  floorPlan: string | null;
  isActive: boolean;
  isFeatured: boolean;
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
  currency: string;
  amenities: string[];
  images: {
    id: string;
    roomTypeId: string;
    imageId: string;
    context: string | null;
    isPrimary: boolean;
    sortOrder: number;
    createdAt: Date;
    image: {
      id: string;
      originalUrl: string;
      thumbnailUrl: string | null;
      mediumUrl: string | null;
      largeUrl: string | null;
      title: string | null;
      description: string | null;
      altText: string | null;
      caption: string | null;
    };
  }[];
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
  specialFeatures: string[];
  isActive: boolean;
  outOfOrderUntil: Date | null;
  roomImages?: Array<{
    fileName: string;
    name: string;
    fileUrl: string;
  }>;
}

export interface UpdateRoomData extends CreateRoomData {
  id: string;
  removeImageIds?: string[];
}

// Helper function to get current user
async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  return session.user;
}

// Helper function to determine MIME type from filename
function getImageMimeType(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
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
            rates: {
              where: { isActive: true },
              select: { currency: true },
              take: 1,
            },
          },
        },
        images: {
          include: {
            image: true
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' }
          ]
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
            rates: {
              where: { isActive: true },
              select: { currency: true },
              take: 1,
            },
          },
        },
        images: {
          include: {
            image: true
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' }
          ]
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
    const user = await getCurrentUser();

    await prisma.$transaction(async (tx) => {
      const createdRoom = await tx.room.create({
        data: {
          businessUnitId: data.businessUnitId,
          roomTypeId: data.roomTypeId,
          roomNumber: data.roomNumber,
          floor: data.floor,
          wing: data.wing,
          status: data.status,
          housekeeping: data.housekeeping,
          notes: data.notes,
          specialFeatures: data.specialFeatures,
          isActive: data.isActive,
          outOfOrderUntil: data.outOfOrderUntil,
        },
      });

      // Handle room images
      if (data.roomImages && data.roomImages.length > 0) {
        for (let i = 0; i < data.roomImages.length; i++) {
          const imageData = data.roomImages[i];
          
          const createdImage = await tx.image.create({
            data: {
              filename: imageData.fileName,
              originalName: imageData.name,
              mimeType: getImageMimeType(imageData.fileName),
              size: 0,
              originalUrl: imageData.fileUrl,
              title: imageData.name,
              category: 'ROOM_SPECIFIC',
              uploaderId: user.id,
            }
          });

          await tx.roomImage.create({
            data: {
              roomId: createdRoom.id,
              imageId: createdImage.id,
              context: 'gallery',
              sortOrder: i,
              isPrimary: i === 0,
            }
          });
        }
      }
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
    const user = await getCurrentUser();
    const { id, ...updateData } = data;

    await prisma.$transaction(async (tx) => {
      await tx.room.update({
        where: { id },
        data: {
          businessUnitId: updateData.businessUnitId,
          roomTypeId: updateData.roomTypeId,
          roomNumber: updateData.roomNumber,
          floor: updateData.floor,
          wing: updateData.wing,
          status: updateData.status,
          housekeeping: updateData.housekeeping,
          notes: updateData.notes,
          specialFeatures: updateData.specialFeatures,
          isActive: updateData.isActive,
          outOfOrderUntil: updateData.outOfOrderUntil,
          updatedAt: new Date(),
        }
      });

      // Handle image removal if specified
      if (data.removeImageIds && data.removeImageIds.length > 0) {
        await tx.roomImage.deleteMany({
          where: {
            roomId: id,
            imageId: {
              in: data.removeImageIds
            }
          }
        });

        for (const imageId of data.removeImageIds) {
          const imageUsageCount = await tx.roomImage.count({
            where: { imageId: imageId }
          });

          if (imageUsageCount === 0) {
            await tx.image.delete({ 
              where: { id: imageId },
            }).catch(() => {});
          }
        }
      }

      // Handle new room images
      if (data.roomImages && data.roomImages.length > 0) {
        for (let i = 0; i < data.roomImages.length; i++) {
          const imageData = data.roomImages[i];
          
          const createdImage = await tx.image.create({
            data: {
              filename: imageData.fileName,
              originalName: imageData.name,
              mimeType: getImageMimeType(imageData.fileName),
              size: 0,
              originalUrl: imageData.fileUrl,
              title: imageData.name,
              category: ImageCategory.ROOM_SPECIFIC,
              uploaderId: user.id,
            }
          });

          await tx.roomImage.create({
            data: {
              roomId: id,
              imageId: createdImage.id,
              context: 'gallery',
              isPrimary: i === 0,
            }
          });
        }
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
