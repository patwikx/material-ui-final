'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { RestaurantType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { InputJsonValue } from '@prisma/client/runtime/library';

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

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
}

// FIX: Added all missing fields from the Prisma schema
export interface CreateRestaurantData {
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
}

// FIX: Added all missing fields from the Prisma schema
export interface UpdateRestaurantData {
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
    await prisma.restaurant.create({
      data: {
        ...data,
        averageMeal: data.averageMeal ? new Decimal(data.averageMeal) : null,
        operatingHours: data.operatingHours as InputJsonValue,
      },
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
    const { id, ...updateData } = data;
    await prisma.restaurant.update({
      where: { id },
      data: {
        ...updateData,
        averageMeal: updateData.averageMeal ? new Decimal(updateData.averageMeal) : null,
        operatingHours: updateData.operatingHours as InputJsonValue,
        updatedAt: new Date(),
      },
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