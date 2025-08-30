'use server';

import { OfferStatus, OfferType } from '@prisma/client';
import { SpecialOfferData } from '../actions/special-offers';
import { prisma } from '../prisma';
import { auth } from '@/auth';

import { revalidatePath } from 'next/cache';
import { cache } from 'react';

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
  offerImages?: Array<{
    fileName: string;
    name: string;
    fileUrl: string;
  }>;
  removeImageIds?: string[];
}

export interface UpdateSpecialOfferData extends CreateSpecialOfferData {
  id: string;
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

export const getAllSpecialOffers = cache(async (
  businessUnitId?: string,
): Promise<SpecialOfferData[]> => {
  try {
    const offers = await prisma.specialOffer.findMany({
  where: {
    ...(businessUnitId && { businessUnitId})
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
})

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
    const user = await getCurrentUser();

    await prisma.$transaction(async (tx) => {
      // Create the special offer
      const createdOffer = await tx.specialOffer.create({
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

      // Handle offer images
      if (data.offerImages && data.offerImages.length > 0) {
        for (let i = 0; i < data.offerImages.length; i++) {
          const imageData = data.offerImages[i];
          
          // Create the Image record
          const createdImage = await tx.image.create({
            data: {
              filename: imageData.fileName,
              originalName: imageData.name,
              mimeType: getImageMimeType(imageData.fileName),
              size: 0,
              originalUrl: imageData.fileUrl,
              title: imageData.name,
              category: 'SPECIAL_OFFER',
              uploaderId: user.id,
            }
          });

          // Create the junction table entry
          await tx.specialOfferImage.create({
            data: {
              offerId: createdOffer.id,
              imageId: createdImage.id,
              context: 'gallery',
              sortOrder: i,
              isPrimary: i === 0,
            }
          });
        }
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
    const user = await getCurrentUser();

    await prisma.$transaction(async (tx) => {
      // Update the special offer
      await tx.specialOffer.update({
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

      // Handle image removal if specified
      if (data.removeImageIds && data.removeImageIds.length > 0) {
        await tx.specialOfferImage.deleteMany({
          where: {
            offerId: data.id,
            imageId: {
              in: data.removeImageIds
            }
          }
        });

        for (const imageId of data.removeImageIds) {
          const imageUsageCount = await tx.specialOfferImage.count({
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

      // Handle new offer images
      if (data.offerImages && data.offerImages.length > 0) {
        for (let i = 0; i < data.offerImages.length; i++) {
          const imageData = data.offerImages[i];
          
          // Create the Image record
          const createdImage = await tx.image.create({
            data: {
              filename: imageData.fileName,
              originalName: imageData.name,
              mimeType: getImageMimeType(imageData.fileName),
              size: 0,
              originalUrl: imageData.fileUrl,
              title: imageData.name,
              category: 'SPECIAL_OFFER',
              uploaderId: user.id,
            }
          });

          // Create the junction table entry
          await tx.specialOfferImage.create({
            data: {
              offerId: data.id,
              imageId: createdImage.id,
              context: 'gallery',
              sortOrder: i,
              isPrimary: i === 0,
            }
          });
        }
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
