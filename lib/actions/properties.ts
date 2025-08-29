// lib/actions/business-units.ts
'use server';

import { BusinessUnitData } from '../../types/properties';
import { prisma } from '../prisma'; // Adjust path to your prisma client


export async function getFeaturedBusinessUnits(): Promise<BusinessUnitData[]> {
  try {
    const businessUnits = await prisma.businessUnit.findMany({
      where: {
        isActive: true,
        isPublished: true,
      },
      include: {
        images: {
          include: {
            image: {
              select: {
                id: true,
                originalUrl: true,
                title: true,
                altText: true,
                description: true,
              },
            },
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        amenities: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
            category: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        _count: {
          select: {
            rooms: true,
            specialOffers: {
              where: {
                status: 'ACTIVE',
                isPublished: true,
              },
            },
            restaurants: {
              where: {
                isActive: true,
                isPublished: true,
              },
            },
            events: {
              where: {
                status: 'CONFIRMED',
                isPublished: true,
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
    console.error('Error fetching business units:', error);
    throw new Error('Failed to fetch business units');
  }
}

export async function getBusinessUnitBySlug(slug: string): Promise<BusinessUnitData | null> {
  try {
    const businessUnit = await prisma.businessUnit.findUnique({
      where: {
        slug,
        isActive: true,
        isPublished: true,
      },
      include: {
        images: {
          include: {
            image: {
              select: {
                id: true,
                originalUrl: true,
                title: true,
                altText: true,
                description: true,
              },
            },
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        amenities: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
            category: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        _count: {
          select: {
            rooms: true,
            specialOffers: {
              where: {
                status: 'ACTIVE',
                isPublished: true,
              },
            },
            restaurants: {
              where: {
                isActive: true,
                isPublished: true,
              },
            },
            events: {
              where: {
                status: 'CONFIRMED',
                isPublished: true,
              },
            },
          },
        },
      },
    });

    return businessUnit;
  } catch (error) {
    console.error('Error fetching business unit by slug:', error);
    throw new Error('Failed to fetch business unit');
  }
}