// lib/room-details.ts
'use server';

import { prisma } from '@/lib/prisma';
import { cache } from 'react';

// Re-defining the interface with the corrected businessUnit type
export interface RoomTypeDetailData {
  id: string;
  businessUnitId: string;
  name: string;
  displayName: string;
  description: string | null;
  type: string;
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
    city: string;
    state: string | null;
    country: string;
    slug: string;
    // These are the missing fields that caused the errors
    checkInTime: string | null;
    checkOutTime: string | null;
    cancellationHours: number | null;
    primaryCurrency: string | null;
    description: string | null;
  };
  amenities: Array<{
    id: string;
    amenity: {
      id: string;
      name: string;
      description: string | null;
      icon: string | null;
      category: string | null;
    };
  }>;
  images: Array<{
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
  }>;
  rates: Array<{
    id: string;
    name: string;
    description: string | null;
    baseRate: string;
    currency: string;
    validFrom: Date | null;
    validTo: Date | null;
    isActive: boolean;
    isDefault: boolean;
  }>;
  _count: {
    rooms: number;
  };
}

export interface PropertyRoomsData {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  shortDescription: string | null;
  propertyType: string;
  city: string;
  state: string | null;
  country: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  slug: string;
  isActive: boolean;
  isPublished: boolean;
  roomTypes: Array<{
    id: string;
    name: string;
    displayName: string;
    description: string | null;
    type: string;
    maxOccupancy: number;
    baseRate: string;
    currency: string;
    isActive: boolean;
    images: Array<{
      id: string;
      isPrimary: boolean;
      image: {
        originalUrl: string;
        thumbnailUrl: string | null;
        mediumUrl: string | null;
        altText: string | null;
        title: string | null;
      };
    }>;
    _count: {
      rooms: number;
    };
  }>;
  images: Array<{
    id: string;
    isPrimary: boolean;
    context: string | null;
    sortOrder: number;
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
  }>;
}

export const getRoomTypeByIdAndProperty = cache(async (
  roomTypeId: string,
  propertySlug: string
): Promise<RoomTypeDetailData | null> => {
  try {
    const roomType = await prisma.roomType_Model.findFirst({
      where: {
        id: roomTypeId,
        businessUnit: {
          slug: propertySlug,
          isActive: true,
          isPublished: true,
        },
        isActive: true,
      },
      include: {
        businessUnit: {
          select: {
            id: true,
            name: true,
            displayName: true,
            city: true,
            state: true,
            country: true,
            slug: true,
            // CORRECTED: Explicitly select the missing fields
            checkInTime: true,
            checkOutTime: true,
            cancellationHours: true,
            primaryCurrency: true,
            description: true,
          },
        },
        amenities: {
          include: {
            amenity: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
                category: true,
              },
            },
          },
          orderBy: {
            amenity: {
              name: 'asc',
            },
          },
        },
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
                caption: true,
              },
            },
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        rates: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            description: true,
            baseRate: true,
            currency: true,
            validFrom: true,
            validTo: true,
            isActive: true,
            isDefault: true,
          },
          orderBy: [
            { isDefault: 'desc' },
            { baseRate: 'asc' },
          ],
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });

    if (!roomType) return null;

    // Explicitly map the Prisma result to match the interface
    return {
      id: roomType.id,
      businessUnitId: roomType.businessUnitId,
      name: roomType.name,
      displayName: roomType.displayName,
      description: roomType.description,
      type: roomType.type,
      maxOccupancy: roomType.maxOccupancy,
      maxAdults: roomType.maxAdults,
      maxChildren: roomType.maxChildren,
      maxInfants: roomType.maxInfants,
      bedConfiguration: roomType.bedConfiguration,
      roomSize: roomType.roomSize?.toNumber() ?? null,
      hasBalcony: roomType.hasBalcony,
      hasOceanView: roomType.hasOceanView,
      hasPoolView: roomType.hasPoolView,
      hasKitchenette: roomType.hasKitchenette,
      hasLivingArea: roomType.hasLivingArea,
      smokingAllowed: roomType.smokingAllowed,
      petFriendly: roomType.petFriendly,
      isAccessible: roomType.isAccessible,
      baseRate: roomType.baseRate.toString(),
      extraPersonRate: roomType.extraPersonRate?.toString() ?? null,
      extraChildRate: roomType.extraChildRate?.toString() ?? null,
      floorPlan: roomType.floorPlan,
      isActive: roomType.isActive,
      sortOrder: roomType.sortOrder,
      createdAt: roomType.createdAt,
      updatedAt: roomType.updatedAt,
      // Pass the fully selected businessUnit object
      businessUnit: roomType.businessUnit,
      amenities: roomType.amenities.map(amenityLink => ({
        id: amenityLink.amenityId,
        amenity: amenityLink.amenity,
      })),
      images: roomType.images,
      rates: roomType.rates.map(rate => ({
        ...rate,
        baseRate: rate.baseRate.toString(),
      })),
      _count: roomType._count,
    };
  } catch (error) {
    console.error('Error fetching room type details:', error);
    return null;
  }
});

// The rest of your file remains unchanged
export const getPropertyWithRooms = cache(async (slug: string): Promise<PropertyRoomsData | null> => {
  try {
    const property = await prisma.businessUnit.findFirst({
      where: {
        slug,
        isActive: true,
        isPublished: true,
      },
      include: {
        roomTypes: {
          where: {
            isActive: true,
          },
          include: {
            images: {
              include: {
                image: {
                  select: {
                    originalUrl: true,
                    thumbnailUrl: true,
                    mediumUrl: true,
                    altText: true,
                    title: true,
                  },
                },
              },
              orderBy: [
                { isPrimary: 'desc' },
                { sortOrder: 'asc' },
              ],
            },
            rates: {
              where: {
                isActive: true,
                isDefault: true,
              },
              select: {
                baseRate: true,
                currency: true,
              },
              take: 1,
            },
            _count: {
              select: {
                rooms: true,
              },
            },
          },
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' },
          ],
        },
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
                caption: true,
              },
            },
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
      },
    });

    if (!property) return null;

    return {
      ...property,
      roomTypes: property.roomTypes.map(roomType => ({
        ...roomType,
        baseRate: roomType.baseRate.toString(),
        currency: roomType.rates[0]?.currency || 'PHP',
      })),
    };
  } catch (error) {
    console.error('Error fetching property with rooms:', error);
    return null;
  }
});