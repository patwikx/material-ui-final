'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { PropertyType } from '@prisma/client';

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

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
  // FIX: Added missing fields
  createdAt: Date;
  updatedAt: Date;
  _count: {
    rooms: number;
    restaurants: number;
    specialOffers: number;
    events: number;
  };
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

export interface CreateBusinessUnitData {
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
}

export interface UpdateBusinessUnitData extends CreateBusinessUnitData {
  id: string;
}

export async function getAllBusinessUnits(businessUnitId?: string): Promise<BusinessUnitData[]> {
  try {
    const businessUnits = await prisma.businessUnit.findMany({
      where: {
        ...(businessUnitId && { id: businessUnitId }),
      },
      include: {
        images: {
          select: {
            id: true,
            isPrimary: true,
            image: {
              select: {
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
        { displayName: 'asc' },
      ],
    });

    return businessUnits;
  } catch (error) {
    console.error('Error fetching all business units:', error);
    return [];
  }
}

export async function getBusinessUnitById(id: string): Promise<BusinessUnitData | null> {
  try {
    const businessUnit = await prisma.businessUnit.findUnique({
      where: { id },
      include: {
        // FIX: Included images, createdAt, updatedAt, and _count to match the interface
        images: {
          select: {
            id: true,
            isPrimary: true,
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
    });

    if (!businessUnit) return null;

    return businessUnit;
  } catch (error) {
    console.error('Error fetching business unit by ID:', error);
    return null;
  }
}

export async function createBusinessUnit(data: CreateBusinessUnitData): Promise<ActionResult> {
  try {
    await prisma.businessUnit.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        shortDescription: data.shortDescription,
        propertyType: data.propertyType,
        city: data.city,
        state: data.state,
        country: data.country,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        phone: data.phone,
        email: data.email,
        website: data.website,
        slug: data.slug,
        isActive: data.isActive,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        logo: data.logo,
      }
    });

    revalidatePath('/admin/operations/properties');
    revalidatePath('/');

    return {
      success: true,
      message: 'Business unit created successfully'
    };
  } catch (error) {
    console.error('Error creating business unit:', error);
    return {
      success: false,
      message: 'Failed to create business unit'
    };
  }
}

export async function updateBusinessUnit(data: UpdateBusinessUnitData): Promise<ActionResult> {
  try {
    await prisma.businessUnit.update({
      where: { id: data.id },
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        shortDescription: data.shortDescription,
        propertyType: data.propertyType,
        city: data.city,
        state: data.state,
        country: data.country,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        phone: data.phone,
        email: data.email,
        website: data.website,
        slug: data.slug,
        isActive: data.isActive,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        logo: data.logo,
        updatedAt: new Date(),
      }
    });

    revalidatePath('/admin/operations/properties');
    revalidatePath('/');

    return {
      success: true,
      message: 'Business unit updated successfully'
    };
  } catch (error) {
    console.error('Error updating business unit:', error);
    return {
      success: false,
      message: 'Failed to update business unit'
    };
  }
}

export async function deleteBusinessUnit(id: string): Promise<ActionResult> {
  try {
    await prisma.businessUnit.delete({
      where: { id }
    });

    revalidatePath('/admin/operations/properties');
    revalidatePath('/');

    return {
      success: true,
      message: 'Business unit deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting business unit:', error);
    return {
      success: false,
      message: 'Failed to delete business unit'
    };
  }
}

export async function toggleBusinessUnitStatus(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    await prisma.businessUnit.update({
      where: { id },
      data: { 
        isActive,
        updatedAt: new Date()
      }
    });

    revalidatePath('/admin/operations/properties');
    revalidatePath('/');

    return {
      success: true,
      message: `Business unit ${isActive ? 'activated' : 'deactivated'} successfully`
    };
  } catch (error) {
    console.error('Error toggling business unit status:', error);
    return {
      success: false,
      message: 'Failed to update business unit status'
    };
  }
}

export async function toggleBusinessUnitFeatured(id: string, isFeatured: boolean): Promise<ActionResult> {
  try {
    await prisma.businessUnit.update({
      where: { id },
      data: { 
        isFeatured,
        updatedAt: new Date()
      }
    });

    revalidatePath('/admin/operations/properties');
    revalidatePath('/');

    return {
      success: true,
      message: `Business unit ${isFeatured ? 'featured' : 'unfeatured'} successfully`
    };
  } catch (error) {
    console.error('Error toggling business unit featured status:', error);
    return {
      success: false,
      message: 'Failed to update business unit featured status'
    };
  }
}