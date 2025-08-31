'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { Decimal } from '@prisma/client/runtime/library';
import { RoomType } from '@prisma/client';
import { auth } from '@/auth';

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

// FIX: Corrected the interface to match the data being returned by the functions
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
  // FIX: Correctly mapping amenities to a simple string array
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
  amenities: string[];
  roomTypeImages?: Array<{
    fileName: string;
    name: string;
    fileUrl: string;
  }>;
}

export interface UpdateRoomTypeData extends CreateRoomTypeData {
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
        images: {
          include: {
            image: true
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' }
          ]
        },
        amenities: {
          include: {
            amenity: true
          }
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
      currency: roomType.rates[0]?.currency || 'PHP',
      // FIX: Correctly map the amenities from the nested relation
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
        images: {
          include: {
            image: true
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' }
          ]
        },
        amenities: {
          include: {
            amenity: true
          }
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
      currency: roomType.rates[0]?.currency || 'PHP',
      // FIX: Correctly map the amenities from the nested relation
      amenities: roomType.amenities.map(a => a.amenity.name),
    };
  } catch (error) {
    console.error('Error fetching room type by ID:', error);
    return null;
  }
}

export async function createRoomType(data: CreateRoomTypeData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    await prisma.$transaction(async (tx) => {
      const createdRoomType = await tx.roomType_Model.create({
        data: {
          name: data.name,
          displayName: data.displayName,
          description: data.description,
          type: data.type,
          baseRate: new Decimal(data.baseRate),
          maxOccupancy: data.maxOccupancy,
          maxAdults: data.maxAdults,
          maxChildren: data.maxChildren,
          maxInfants: data.maxInfants,
          bedConfiguration: data.bedConfiguration,
          roomSize: data.roomSize,
          hasBalcony: data.hasBalcony,
          hasOceanView: data.hasOceanView,
          hasPoolView: data.hasPoolView,
          hasKitchenette: data.hasKitchenette,
          hasLivingArea: data.hasLivingArea,
          smokingAllowed: data.smokingAllowed,
          petFriendly: data.petFriendly,
          isAccessible: data.isAccessible,
          extraPersonRate: data.extraPersonRate ? new Decimal(data.extraPersonRate) : null,
          extraChildRate: data.extraChildRate ? new Decimal(data.extraChildRate) : null,
          floorPlan: data.floorPlan,
          isActive: data.isActive,
          sortOrder: data.sortOrder,
          businessUnitId: data.businessUnitId,
          // FIX: Correctly handle amenities using a nested connect
          amenities: {
            createMany: {
              data: data.amenities.map(amenityName => ({
                amenityId: amenityName, // Assuming the amenityName is the Amenity's ID
              }))
            }
          },
        },
      });

      // Handle room type images
      if (data.roomTypeImages && data.roomTypeImages.length > 0) {
        for (let i = 0; i < data.roomTypeImages.length; i++) {
          const imageData = data.roomTypeImages[i];
          
          const createdImage = await tx.image.create({
            data: {
              filename: imageData.fileName,
              originalName: imageData.name,
              mimeType: getImageMimeType(imageData.fileName),
              size: 0,
              originalUrl: imageData.fileUrl,
              title: imageData.name,
              category: 'ROOM_TYPE',
              uploaderId: user.id,
            }
          });

          await tx.roomTypeImage.create({
            data: {
              roomTypeId: createdRoomType.id,
              imageId: createdImage.id,
              context: 'gallery',
              sortOrder: i,
              isPrimary: i === 0,
            }
          });
        }
      }
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
    const user = await getCurrentUser();
    const { id, ...updateData } = data;

    await prisma.$transaction(async (tx) => {
      await tx.roomType_Model.update({
        where: { id },
        data: {
          name: updateData.name,
          displayName: updateData.displayName,
          description: updateData.description,
          type: updateData.type,
          baseRate: new Decimal(updateData.baseRate),
          maxOccupancy: updateData.maxOccupancy,
          maxAdults: updateData.maxAdults,
          maxChildren: updateData.maxChildren,
          maxInfants: updateData.maxInfants,
          bedConfiguration: updateData.bedConfiguration,
          roomSize: updateData.roomSize,
          hasBalcony: updateData.hasBalcony,
          hasOceanView: updateData.hasOceanView,
          hasPoolView: updateData.hasPoolView,
          hasKitchenette: updateData.hasKitchenette,
          hasLivingArea: updateData.hasLivingArea,
          smokingAllowed: updateData.smokingAllowed,
          petFriendly: updateData.petFriendly,
          isAccessible: updateData.isAccessible,
          extraPersonRate: updateData.extraPersonRate ? new Decimal(updateData.extraPersonRate) : null,
          extraChildRate: updateData.extraChildRate ? new Decimal(updateData.extraChildRate) : null,
          floorPlan: updateData.floorPlan,
          isActive: updateData.isActive,
          sortOrder: updateData.sortOrder,
          businessUnitId: updateData.businessUnitId,
          updatedAt: new Date(),
          // FIX: Correctly handle amenities using a nested update
          amenities: {
            deleteMany: {
              roomTypeId: id,
            },
            createMany: {
              data: updateData.amenities.map(amenityId => ({
                amenityId: amenityId,
              }))
            }
          },
        },
      });

      // Handle image removal if specified
      if (data.removeImageIds && data.removeImageIds.length > 0) {
        await tx.roomTypeImage.deleteMany({
          where: {
            roomTypeId: id,
            imageId: {
              in: data.removeImageIds
            }
          }
        });

        for (const imageId of data.removeImageIds) {
          const imageUsageCount = await tx.roomTypeImage.count({
            where: { imageId: imageId }
          });

          if (imageUsageCount === 0) {
            await tx.image.delete({ 
              where: { id: imageId },
            }).catch(() => {
              // Ignore deletion errors for already deleted images
            });
          }
        }
      }

      // Handle new room type images
      if (data.roomTypeImages && data.roomTypeImages.length > 0) {
        for (let i = 0; i < data.roomTypeImages.length; i++) {
          const imageData = data.roomTypeImages[i];
          
          const createdImage = await tx.image.create({
            data: {
              filename: imageData.fileName,
              originalName: imageData.name,
              mimeType: getImageMimeType(imageData.fileName),
              size: 0,
              originalUrl: imageData.fileUrl,
              title: imageData.name,
              category: 'ROOM_TYPE',
              uploaderId: user.id,
            }
          });

          await tx.roomTypeImage.create({
            data: {
              roomTypeId: id,
              imageId: createdImage.id,
              context: 'gallery',
              sortOrder: i,
              isPrimary: i === 0,
            }
          });
        }
      }
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

export async function toggleRoomTypeFeatured(id: string, isFeatured: boolean): Promise<ActionResult> {
  try {
    await prisma.roomType_Model.update({
      where: { id },
      data: { 
        updatedAt: new Date()
      }
    });

    revalidatePath('/admin/operations/room-types');

    return {
      success: true,
      message: `Room type ${isFeatured ? 'featured' : 'unfeatured'} successfully`
    };
  } catch (error) {
    console.error('Error toggling room type featured status:', error);
    return {
      success: false,
      message: 'Failed to update room type featured status'
    };
  }
}