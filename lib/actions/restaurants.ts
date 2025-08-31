'use server';

import { PrismaClient } from '@prisma/client';
import { cache } from 'react';
import { RestaurantType } from '@prisma/client';


const prisma = new PrismaClient();

// The RestaurantWithDetails interface is likely in another file, but we'll define
// the expected output type here for clarity and correctness.
export interface RestaurantWithDetails {
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
  images: {
    id: string;
    isPrimary: boolean;
    image: {
      originalUrl: string;
      thumbnailUrl: string | null;
      mediumUrl: string | null;
      // FIX: Added largeUrl and description to the image select
      largeUrl: string | null;
      title: string | null;
      description: string | null;
      altText: string | null;
    };
  }[];
}


/**
 * Get all active and published restaurants with their images and business unit details
 */
export const getPublishedRestaurants = cache(async (): Promise<RestaurantWithDetails[]> => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        isActive: true,
        isPublished: true,
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
          where: {
            image: {
              isActive: true,
            },
          },
          include: {
            image: {
              select: {
                id: true,
                originalUrl: true,
                thumbnailUrl: true,
                mediumUrl: true,
                // FIX: Select the missing fields
                largeUrl: true,
                title: true,
                description: true,
                altText: true,
              },
            },
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        _count: {
          select: {
            menuCategories: true,
            reservations: true,
          },
        },
      },
      orderBy: [
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
    console.error('Error fetching restaurants:', error);
    return [];
  }
});

/**
 * Get featured restaurants only
 */
export const getFeaturedRestaurants = cache(async (limit: number = 6): Promise<RestaurantWithDetails[]> => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        isActive: true,
        isPublished: true,
        isFeatured: true,
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
          where: {
            image: {
              isActive: true,
            },
          },
          include: {
            image: {
              select: {
                id: true,
                originalUrl: true,
                thumbnailUrl: true,
                mediumUrl: true,
                // FIX: Select the missing fields
                largeUrl: true,
                title: true,
                description: true,
                altText: true,
              },
            },
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        _count: {
          select: {
            menuCategories: true,
            reservations: true,
          },
        },
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
      take: limit,
    });
    
    return restaurants.map(restaurant => ({
      ...restaurant,
      averageMeal: restaurant.averageMeal?.toString() ?? null,
      operatingHours: restaurant.operatingHours as Record<string, unknown> | null,
    }));
  } catch (error) {
    console.error('Error fetching featured restaurants:', error);
    return [];
  }
});

/**
 * Get restaurants by business unit
 */
export const getRestaurantsByBusinessUnit = cache(async (businessUnitId: string): Promise<RestaurantWithDetails[]> => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        businessUnitId,
        isActive: true,
        isPublished: true,
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
          where: {
            image: {
              isActive: true,
            },
          },
          include: {
            image: {
              select: {
                id: true,
                originalUrl: true,
                thumbnailUrl: true,
                mediumUrl: true,
                // FIX: Select the missing fields
                largeUrl: true,
                title: true,
                description: true,
                altText: true,
              },
            },
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        _count: {
          select: {
            menuCategories: true,
            reservations: true,
          },
        },
      },
      orderBy: [
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
    console.error('Error fetching restaurants by business unit:', error);
    return [];
  }
});

/**
 * Get a single restaurant by slug with detailed information
 */
export const getRestaurantBySlug = cache(async (slug: string): Promise<RestaurantWithDetails | null> => {
  try {
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        slug,
        isActive: true,
        isPublished: true,
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
          where: {
            image: {
              isActive: true,
            },
          },
          include: {
            image: {
              select: {
                id: true,
                originalUrl: true,
                thumbnailUrl: true,
                mediumUrl: true,
                // FIX: Select the missing fields
                largeUrl: true,
                title: true,
                description: true,
                altText: true,
              },
            },
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        menuCategories: {
          where: {
            isActive: true,
          },
          include: {
            items: {
              where: {
                isAvailable: true,
              },
              include: {
                images: {
                  include: {
                    image: {
                      select: {
                        id: true,
                        originalUrl: true,
                        thumbnailUrl: true,
                        mediumUrl: true,
                        largeUrl: true,
                        title: true,
                        description: true,
                        altText: true,
                      },
                    },
                  },
                  orderBy: [
                    { isPrimary: 'desc' },
                    { sortOrder: 'asc' },
                  ],
                },
              },
              orderBy: [
                { isSignature: 'desc' },
                { isRecommended: 'desc' },
                { sortOrder: 'asc' },
                { name: 'asc' },
              ],
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
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
    console.error('Error fetching restaurant by slug:', error);
    throw new Error('Failed to fetch restaurant');
  }
});

/**
 * Increment restaurant view count
 */
export const incrementRestaurantViewCount = async (restaurantId: string): Promise<void> => {
  try {
    await prisma.restaurant.update({
      where: {
        id: restaurantId,
      },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error('Error incrementing restaurant view count:', error);
  }
};