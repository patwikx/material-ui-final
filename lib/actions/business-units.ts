'use server';

import { PrismaClient } from '@prisma/client';
import { PropertyType } from '@prisma/client';

const prisma = new PrismaClient();

export interface BusinessUnitData {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  shortDescription: string | null;
  propertyType: PropertyType;
  city: string;
  state: string | null;
  country: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  slug: string;
  isActive: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  primaryColor: string | null;
  secondaryColor: string | null;
  logo: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    rooms: number;
    restaurants: number;
    specialOffers: number;
    events: number;
  };
  // FIX: Added image details to the interface
  images: {
    id: string;
    isPrimary: boolean;
    image: {
      originalUrl: string;
      thumbnailUrl: string | null;
      mediumUrl: string | null;
      largeUrl: string | null;
      altText: string | null;
      title: string | null;
      description: string | null;
    };
  }[];
}

export async function getBusinessUnits(): Promise<BusinessUnitData[]> {
  try {
    const businessUnits = await prisma.businessUnit.findMany({
      where: {
        isActive: true,
        isPublished: true,
      },
      include: {
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
                largeUrl: true,
                altText: true,
                title: true,
                description: true,
              },
            },
          },
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
        _count: {
          select: {
            rooms: true,
            restaurants: {
              where: {
                isActive: true,
              },
            },
            specialOffers: {
              where: {
                status: 'ACTIVE',
              },
            },
            events: {
              where: {
                status: 'CONFIRMED',
              },
            },
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    return businessUnits;
  } catch (error) {
    console.error('Failed to fetch business units:', error);
    return [];
  }
}

export async function getFeaturedBusinessUnits(): Promise<BusinessUnitData[]> {
  try {
    const businessUnits = await prisma.businessUnit.findMany({
      where: {
        isActive: true,
        isPublished: true,
        isFeatured: true,
      },
      include: {
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
                largeUrl: true,
                altText: true,
                title: true,
                description: true,
              },
            },
          },
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
        _count: {
          select: {
            rooms: true,
            restaurants: {
              where: {
                isActive: true,
              },
            },
            specialOffers: {
              where: {
                status: 'ACTIVE',
              },
            },
            events: {
              where: {
                status: 'CONFIRMED',
              },
            },
          },
        },
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    return businessUnits;
  } catch (error) {
    console.error('Failed to fetch featured business units:', error);
    return [];
  }
}

export async function getBusinessUnitBySlug(slug: string): Promise<BusinessUnitData | null> {
  try {
    const businessUnit = await prisma.businessUnit.findFirst({
      where: { slug },
      include: {
        images: {
          where: {
            image: {
              isActive: true
            }
          },
          include: {
            image: {
              select: {
                id: true,
                originalUrl: true,
                thumbnailUrl: true,
                mediumUrl: true,
                largeUrl: true,
                altText: true,
                title: true,
                description: true,
              }
            }
          },
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }]
        },
        _count: {
          select: {
            rooms: true,
            restaurants: {
              where: {
                isActive: true,
              },
            },
            specialOffers: {
              where: {
                status: 'ACTIVE',
              },
            },
            events: {
              where: {
                status: 'CONFIRMED',
              },
            },
          },
        },
      },
    });

    if (!businessUnit) return null;

    return businessUnit;
  } catch (error) {
    console.error('Error fetching business unit by slug:', error);
    return null;
  }
}