// lib/actions/specialoffers.ts
'use server';

import { prisma } from "../prisma"

export interface SpecialOfferData {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string;
  shortDesc: string | null;
  type: string;
  status: string;
  offerPrice: number;
  originalPrice: number | null;
  savingsAmount: number | null;
  savingsPercent: number | null;
  currency: string;
  validFrom: Date;
  validTo: Date;
  isPublished: boolean;
  isFeatured: boolean;
  isPinned: boolean;
  sortOrder: number;
  businessUnit: {
    id: string;
    name: string;
    displayName: string;
    slug: string;
  } | null;
  images: Array<{
    id: string;
    context: string | null;
    sortOrder: number;
    isPrimary: boolean;
    image: {
      id: string;
      originalUrl: string;
      title: string | null;
      altText: string | null;
    };
  }>;
}

export async function getActiveSpecialOffers(limit?: number): Promise<SpecialOfferData[]> {
  try {
    const offers = await prisma.specialOffer.findMany({
      where: {
        status: 'ACTIVE',
        isPublished: true,
        validFrom: {
          lte: new Date(),
        },
        validTo: {
          gte: new Date(),
        },
      },
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
      take: limit,
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
    console.error('Error fetching special offers:', error);
    return [];
  }
}

export async function getFeaturedSpecialOffers(limit: number = 6): Promise<SpecialOfferData[]> {
  try {
    const offers = await prisma.specialOffer.findMany({
      where: {
        status: 'ACTIVE',
        isPublished: true,
        isFeatured: true,
        validFrom: {
          lte: new Date(),
        },
        validTo: {
          gte: new Date(),
        },
      },
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
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit,
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
    console.error('Error fetching featured special offers:', error);
    return [];
  }
}