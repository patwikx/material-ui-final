'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { RestaurantType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { InputJsonValue } from '@prisma/client/runtime/library';
import { auth } from '@/auth';

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

// FIX: Updated the interface to include the `images` property
export interface RestaurantData {
  id: string;
  businessUnitId: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  type: RestaurantType;
  cuisine: string[];
  location: string | null;
  phone: string | null;
  email: string | null;
  totalSeats: number | null;
  privateRooms: number;
  outdoorSeating: boolean;
  airConditioned: boolean;
  operatingHours: Record<string, unknown> | null;
  features: string[];
  dressCode: string | null;
  priceRange: string | null;
  averageMeal: string | null;
  currency: string;
  acceptsReservations: boolean;
  advanceBookingDays: number;
  minPartySize: number;
  maxPartySize: number | null;
  virtualTourUrl: string | null;
  hasMenu: boolean;
  menuUrl: string | null;
  menuUpdated: Date | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  businessUnit: {
    id: string;
    name: string;
    displayName: string;
  };
  _count: {
    menuCategories: number;
    reservations: number;
  };
  // FIX: Added the missing images property
  images: {
    id: string;
    restaurantId: string;
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


interface BaseRestaurantData {
  businessUnitId: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  type: RestaurantType;
  cuisine: string[];
  location: string | null;
  phone: string | null;
  email: string | null;
  totalSeats: number | null;
  privateRooms: number;
  outdoorSeating: boolean;
  airConditioned: boolean;
  operatingHours: Record<string, unknown> | null;
  features: string[];
  dressCode: string | null;
  priceRange: string | null;
  averageMeal: number | null;
  currency: string;
  acceptsReservations: boolean;
  advanceBookingDays: number;
  minPartySize: number;
  maxPartySize: number | null;
  virtualTourUrl: string | null;
  hasMenu: boolean;
  menuUrl: string | null;
  isActive: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  // Added image handling props
  restaurantImages?: Array<{
    fileName: string;
    name: string;
    fileUrl: string;
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CreateRestaurantData extends BaseRestaurantData {
}

export interface UpdateRestaurantData extends BaseRestaurantData {
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

export async function getAllRestaurants(businessUnitId?: string): Promise<RestaurantData[]> {
  try {
    const restaurants = await prisma.restaurant.findMany({
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
        images: {
          include: {
            image: true
          }
        },
        _count: {
          select: {
            menuCategories: true,
            reservations: true,
          },
        },
      },
      orderBy: [
        { businessUnitId: 'asc' },
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    return restaurants.map(restaurant => ({
      ...restaurant,
      averageMeal: restaurant.averageMeal?.toString() ?? null,
      operatingHours: restaurant.operatingHours as Record<string, unknown> | null,
    }));
  } catch (error) {
    console.error('Error fetching all restaurants:', error);
    return [];
  }
}

export async function getRestaurantById(id: string): Promise<RestaurantData | null> {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        businessUnit: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        images: {
          include: {
            image: true
          }
        },
        _count: {
          select: {
            menuCategories: true,
            reservations: true,
          },
        },
      },
    });

    if (!restaurant) return null;

    return {
      ...restaurant,
      averageMeal: restaurant.averageMeal?.toString() ?? null,
      operatingHours: restaurant.operatingHours as Record<string, unknown> | null,
    };
  } catch (error) {
    console.error('Error fetching restaurant by ID:', error);
    return null;
  }
}

export async function createRestaurant(data: CreateRestaurantData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    await prisma.$transaction(async (tx) => {
      const createdRestaurant = await tx.restaurant.create({
        data: {
          ...data,
          averageMeal: data.averageMeal ? new Decimal(data.averageMeal) : null,
          operatingHours: data.operatingHours as InputJsonValue,
        },
      });

      if (data.restaurantImages && data.restaurantImages.length > 0) {
        for (let i = 0; i < data.restaurantImages.length; i++) {
          const imageData = data.restaurantImages[i];
          
          const createdImage = await tx.image.create({
            data: {
              filename: imageData.fileName,
              originalName: imageData.name,
              mimeType: getImageMimeType(imageData.fileName),
              size: 0,
              originalUrl: imageData.fileUrl,
              title: imageData.name,
              category: 'RESTAURANT',
              uploaderId: user.id,
            }
          });

          await tx.restaurantImage.create({
            data: {
              restaurantId: createdRestaurant.id,
              imageId: createdImage.id,
              context: 'gallery',
              sortOrder: i,
              isPrimary: i === 0,
            }
          });
        }
      }
    });

    revalidatePath('/admin/operations/restaurants');

    return {
      success: true,
      message: 'Restaurant created successfully',
    };
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return {
      success: false,
      message: 'Failed to create restaurant',
    };
  }
}

export async function updateRestaurant(data: UpdateRestaurantData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    const { id, ...updateData } = data;

    await prisma.$transaction(async (tx) => {
      await tx.restaurant.update({
        where: { id },
        data: {
          ...updateData,
          averageMeal: updateData.averageMeal ? new Decimal(updateData.averageMeal) : null,
          operatingHours: updateData.operatingHours as InputJsonValue,
          updatedAt: new Date(),
        },
      });

      // Handle image removal if specified
      if (data.removeImageIds && data.removeImageIds.length > 0) {
        await tx.restaurantImage.deleteMany({
          where: {
            restaurantId: id,
            imageId: {
              in: data.removeImageIds
            }
          }
        });

        for (const imageId of data.removeImageIds) {
          const imageUsageCount = await tx.restaurantImage.count({
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

      // Handle new restaurant images
      if (data.restaurantImages && data.restaurantImages.length > 0) {
        for (let i = 0; i < data.restaurantImages.length; i++) {
          const imageData = data.restaurantImages[i];
          
          const createdImage = await tx.image.create({
            data: {
              filename: imageData.fileName,
              originalName: imageData.name,
              mimeType: getImageMimeType(imageData.fileName),
              size: 0,
              originalUrl: imageData.fileUrl,
              title: imageData.name,
              category: 'RESTAURANT',
              uploaderId: user.id,
            }
          });

          await tx.restaurantImage.create({
            data: {
              restaurantId: id,
              imageId: createdImage.id,
              context: 'gallery',
              sortOrder: i,
              isPrimary: i === 0,
            }
          });
        }
      }
    });

    revalidatePath('/admin/operations/restaurants');

    return {
      success: true,
      message: 'Restaurant updated successfully',
    };
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return {
      success: false,
      message: 'Failed to update restaurant',
    };
  }
}

export async function deleteRestaurant(id: string): Promise<ActionResult> {
  try {
    await prisma.restaurant.delete({
      where: { id },
    });

    revalidatePath('/admin/operations/restaurants');

    return {
      success: true,
      message: 'Restaurant deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    return {
      success: false,
      message: 'Failed to delete restaurant',
    };
  }
}

export async function toggleRestaurantStatus(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    await prisma.restaurant.update({
      where: { id },
      data: {
        isActive,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/operations/restaurants');

    return {
      success: true,
      message: `Restaurant ${isActive ? 'activated' : 'deactivated'} successfully`,
    };
  } catch (error) {
    console.error('Error toggling restaurant status:', error);
    return {
      success: false,
      message: 'Failed to update restaurant status',
    };
  }
}

export async function toggleRestaurantFeatured(id: string, isFeatured: boolean): Promise<ActionResult> {
  try {
    await prisma.restaurant.update({
      where: { id },
      data: {
        isFeatured,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/operations/restaurants');

    return {
      success: true,
      message: `Restaurant ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
    };
  } catch (error) {
    console.error('Error toggling restaurant featured status:', error);
    return {
      success: false,
      message: 'Failed to update restaurant featured status',
    };
  }
}
