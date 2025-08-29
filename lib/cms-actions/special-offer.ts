'use server';

import { OfferStatus, OfferType } from '@prisma/client';
import { SpecialOfferData } from '../actions/special-offers';
import { prisma } from '../prisma';

import { revalidatePath } from 'next/cache';

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export interface CreateSpecialOfferData {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  shortDesc: string;
  type: OfferType;
  status: OfferStatus;
  offerPrice: number;
  originalPrice: number | null;
  savingsAmount: number | null;
  savingsPercent: number | null;
  currency: string;
  validFrom: Date;
  validTo: Date;
  businessUnitId: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  isPinned: boolean;
  sortOrder: number;
}

export interface UpdateSpecialOfferData extends CreateSpecialOfferData {
  id: string;
}

export async function getAllSpecialOffers(): Promise<SpecialOfferData[]> {
  try {
    const offers = await prisma.specialOffer.findMany({
      include: {
        businessUnit: {
          select: {
            id: true,
            name: true,
            displayName: true,
            slug: true,
          },
        },
        images: {
          include: {
            image: {
              select: {
                id: true,
                originalUrl: true,
                title: true,
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
        { isPinned: 'desc' },
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return offers.map(offer => ({
      id: offer.id,
      title: offer.title,
      slug: offer.slug,
      subtitle: offer.subtitle,
      description: offer.description,
      shortDesc: offer.shortDesc,
      type: offer.type,
      status: offer.status,
      offerPrice: Number(offer.offerPrice),
      originalPrice: offer.originalPrice ? Number(offer.originalPrice) : null,
      savingsAmount: offer.savingsAmount ? Number(offer.savingsAmount) : null,
      savingsPercent: offer.savingsPercent,
      currency: offer.currency,
      validFrom: offer.validFrom,
      validTo: offer.validTo,
      isPublished: offer.isPublished,
      isFeatured: offer.isFeatured,
      isPinned: offer.isPinned,
      sortOrder: offer.sortOrder,
      businessUnit: offer.businessUnit,
      images: offer.images.map(img => ({
        id: img.id,
        context: img.context,
        sortOrder: img.sortOrder,
        isPrimary: img.isPrimary,
        image: img.image,
      })),
    }));
  } catch (error) {
    console.error('Error fetching all special offers:', error);
    return [];
  }
}

export async function getSpecialOfferById(id: string): Promise<SpecialOfferData | null> {
  try {
    const offer = await prisma.specialOffer.findUnique({
      where: { id },
      include: {
        businessUnit: {
          select: {
            id: true,
            name: true,
            displayName: true,
            slug: true,
          },
        },
        images: {
          include: {
            image: {
              select: {
                id: true,
                originalUrl: true,
                title: true,
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
    });

    if (!offer) return null;

    return {
      id: offer.id,
      title: offer.title,
      slug: offer.slug,
      subtitle: offer.subtitle,
      description: offer.description,
      shortDesc: offer.shortDesc,
      type: offer.type,
      status: offer.status,
      offerPrice: Number(offer.offerPrice),
      originalPrice: offer.originalPrice ? Number(offer.originalPrice) : null,
      savingsAmount: offer.savingsAmount ? Number(offer.savingsAmount) : null,
      savingsPercent: offer.savingsPercent,
      currency: offer.currency,
      validFrom: offer.validFrom,
      validTo: offer.validTo,
      isPublished: offer.isPublished,
      isFeatured: offer.isFeatured,
      isPinned: offer.isPinned,
      sortOrder: offer.sortOrder,
      businessUnit: offer.businessUnit,
      images: offer.images.map(img => ({
        id: img.id,
        context: img.context,
        sortOrder: img.sortOrder,
        isPrimary: img.isPrimary,
        image: img.image,
      })),
    };
  } catch (error) {
    console.error('Error fetching special offer by ID:', error);
    return null;
  }
}

export async function createSpecialOffer(data: CreateSpecialOfferData): Promise<ActionResult> {
  try {
    await prisma.specialOffer.create({
      data: {
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle || null,
        description: data.description,
        shortDesc: data.shortDesc || null,
        type: data.type,
        status: data.status,
        offerPrice: data.offerPrice,
        originalPrice: data.originalPrice,
        savingsAmount: data.savingsAmount,
        savingsPercent: data.savingsPercent,
        currency: data.currency,
        validFrom: data.validFrom,
        validTo: data.validTo,
        businessUnitId: data.businessUnitId,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
        isPinned: data.isPinned,
        sortOrder: data.sortOrder,
      }
    });

    revalidatePath('/admin/cms/special-offers');
    revalidatePath('/');

    return {
      success: true,
      message: 'Special offer created successfully'
    };
  } catch (error) {
    console.error('Error creating special offer:', error);
    return {
      success: false,
      message: 'Failed to create special offer'
    };
  }
}

export async function updateSpecialOffer(data: UpdateSpecialOfferData): Promise<ActionResult> {
  try {
    await prisma.specialOffer.update({
      where: { id: data.id },
      data: {
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle || null,
        description: data.description,
        shortDesc: data.shortDesc || null,
        type: data.type,
        status: data.status,
        offerPrice: data.offerPrice,
        originalPrice: data.originalPrice,
        savingsAmount: data.savingsAmount,
        savingsPercent: data.savingsPercent,
        currency: data.currency,
        validFrom: data.validFrom,
        validTo: data.validTo,
        businessUnitId: data.businessUnitId,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
        isPinned: data.isPinned,
        sortOrder: data.sortOrder,
        updatedAt: new Date(),
      }
    });

    revalidatePath('/admin/cms/special-offers');
    revalidatePath('/');

    return {
      success: true,
      message: 'Special offer updated successfully'
    };
  } catch (error) {
    console.error('Error updating special offer:', error);
    return {
      success: false,
      message: 'Failed to update special offer'
    };
  }
}

export async function deleteSpecialOffer(id: string): Promise<ActionResult> {
  try {
    await prisma.specialOffer.delete({
      where: { id }
    });

    revalidatePath('/admin/cms/special-offers');
    revalidatePath('/');

    return {
      success: true,
      message: 'Special offer deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting special offer:', error);
    return {
      success: false,
      message: 'Failed to delete special offer'
    };
  }
}

export async function toggleSpecialOfferStatus(id: string, isPublished: boolean): Promise<ActionResult> {
  try {
    await prisma.specialOffer.update({
      where: { id },
      data: { 
        isPublished,
        updatedAt: new Date()
      }
    });

    revalidatePath('/admin/cms/special-offers');
    revalidatePath('/');

    return {
      success: true,
      message: `Special offer ${isPublished ? 'published' : 'unpublished'} successfully`
    };
  } catch (error) {
    console.error('Error toggling special offer status:', error);
    return {
      success: false,
      message: 'Failed to update special offer status'
    };
  }
}

export async function toggleSpecialOfferFeatured(id: string, isFeatured: boolean): Promise<ActionResult> {
  try {
    await prisma.specialOffer.update({
      where: { id },
      data: { 
        isFeatured,
        updatedAt: new Date()
      }
    });

    revalidatePath('/admin/cms/special-offers');
    revalidatePath('/');

    return {
      success: true,
      message: `Special offer ${isFeatured ? 'featured' : 'unfeatured'} successfully`
    };
  } catch (error) {
    console.error('Error toggling special offer featured status:', error);
    return {
      success: false,
      message: 'Failed to update special offer featured status'
    };
  }
}