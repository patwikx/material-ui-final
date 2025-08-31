'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { InputJsonValue } from '@prisma/client/runtime/library';
import { ImageCategory } from '@prisma/client';
import { auth } from '@/auth';

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export interface GuestData {
  id: string;
  businessUnitId: string;
  title: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: Date | null;
  nationality: string | null;
  passportNumber: string | null;
  passportExpiry: Date | null;
  idNumber: string | null;
  idType: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  vipStatus: boolean;
  loyaltyNumber: string | null;
  preferences: Record<string, unknown> | null;
  notes: string | null;
  firstStayDate: Date | null;
  lastStayDate: Date | null;
  blacklistedAt: Date | null;
  totalSpent: string | null;
  marketingOptIn: boolean;
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    reservations: number;
    stays: number;
  };
  images: {
    id: string;
    guestId: string;
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

export interface CreateGuestData {
  businessUnitId: string;
  title: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: Date | null;
  nationality: string | null;
  country: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  passportNumber: string | null;
  passportExpiry: Date | null;
  idNumber: string | null;
  idType: string | null;
  preferences: Record<string, unknown> | null;
  notes: string | null;
  vipStatus: boolean;
  loyaltyNumber: string | null;
  marketingOptIn: boolean;
  source: string | null;
  guestImages?: Array<{
    fileName: string;
    name: string;
    fileUrl: string;
  }>;
}

export interface UpdateGuestData extends CreateGuestData {
  id: string;
  removeImageIds?: string[];
}

async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  return session.user;
}

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

export async function getAllGuests(businessUnitId?: string): Promise<GuestData[]> {
  try {
    const guests = await prisma.guest.findMany({
      where: {
        ...(businessUnitId && { businessUnitId }),
      },
      include: {
        images: {
          include: {
            image: true,
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        _count: {
          select: {
            reservations: true,
            stays: true,
          },
        },
      },
      orderBy: [
        { vipStatus: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return guests.map(guest => ({
      ...guest,
      totalSpent: guest.totalSpent?.toString() ?? null,
      preferences: guest.preferences as Record<string, unknown> | null,
    }));
  } catch (error) {
    console.error('Error fetching all guests:', error);
    return [];
  }
}

export async function getGuestById(id: string): Promise<GuestData | null> {
  try {
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        images: {
          include: {
            image: true,
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        _count: {
          select: {
            reservations: true,
            stays: true,
          },
        },
      },
    });

    if (!guest) return null;

    return {
      ...guest,
      totalSpent: guest.totalSpent?.toString() ?? null,
      preferences: guest.preferences as Record<string, unknown> | null,
    };
  } catch (error) {
    console.error('Error fetching guest by ID:', error);
    return null;
  }
}

export async function createGuest(data: CreateGuestData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    await prisma.$transaction(async (tx) => {
      const createdGuest = await tx.guest.create({
        data: {
          businessUnitId: data.businessUnitId,
          title: data.title,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          nationality: data.nationality,
          country: data.country,
          address: data.address,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          passportNumber: data.passportNumber,
          passportExpiry: data.passportExpiry,
          idNumber: data.idNumber,
          idType: data.idType,
          preferences: data.preferences as InputJsonValue,
          notes: data.notes,
          vipStatus: data.vipStatus,
          loyaltyNumber: data.loyaltyNumber,
          marketingOptIn: data.marketingOptIn,
          source: data.source,
        },
      });

      if (data.guestImages && data.guestImages.length > 0) {
        for (let i = 0; i < data.guestImages.length; i++) {
          const imageData = data.guestImages[i];
          
          const createdImage = await tx.image.create({
            data: {
              filename: imageData.fileName,
              originalName: imageData.name,
              mimeType: getImageMimeType(imageData.fileName),
              size: 0,
              originalUrl: imageData.fileUrl,
              title: imageData.name,
              category: ImageCategory.AVATAR,
              uploaderId: user.id,
            }
          });

          await tx.guestImage.create({
            data: {
              guestId: createdGuest.id,
              imageId: createdImage.id,
              context: 'profile',
              sortOrder: i,
              isPrimary: i === 0,
            }
          });
        }
      }
    });

    revalidatePath('/admin/operations/guests');

    return {
      success: true,
      message: 'Guest created successfully',
    };
  } catch (error) {
    console.error('Error creating guest:', error);
    return {
      success: false,
      message: error instanceof Error && error.message === 'User not authenticated'
        ? 'You must be logged in to create a guest'
        : 'Failed to create guest',
    };
  }
}

export async function updateGuest(data: UpdateGuestData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    const { id, ...updateData } = data;

    await prisma.$transaction(async (tx) => {
      await tx.guest.update({
        where: { id },
        data: {
          businessUnitId: updateData.businessUnitId,
          title: updateData.title,
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          email: updateData.email,
          phone: updateData.phone,
          dateOfBirth: updateData.dateOfBirth,
          nationality: updateData.nationality,
          country: updateData.country,
          address: updateData.address,
          city: updateData.city,
          state: updateData.state,
          postalCode: updateData.postalCode,
          passportNumber: updateData.passportNumber,
          passportExpiry: updateData.passportExpiry,
          idNumber: updateData.idNumber,
          idType: updateData.idType,
          preferences: updateData.preferences as InputJsonValue,
          notes: updateData.notes,
          vipStatus: updateData.vipStatus,
          loyaltyNumber: updateData.loyaltyNumber,
          marketingOptIn: updateData.marketingOptIn,
          source: updateData.source,
          updatedAt: new Date(),
        },
      });

      if (data.removeImageIds && data.removeImageIds.length > 0) {
        await tx.guestImage.deleteMany({
          where: {
            guestId: id,
            imageId: {
              in: data.removeImageIds,
            },
          },
        });

        for (const imageId of data.removeImageIds) {
          const imageUsageCount = await tx.guestImage.count({
            where: { imageId: imageId },
          });

          if (imageUsageCount === 0) {
            await tx.image
              .delete({
                where: { id: imageId },
              })
              .catch(() => {
                // Ignore deletion errors for already deleted images
              });
          }
        }
      }

      if (data.guestImages && data.guestImages.length > 0) {
        for (let i = 0; i < data.guestImages.length; i++) {
          const imageData = data.guestImages[i];
          
          const createdImage = await tx.image.create({
            data: {
              filename: imageData.fileName,
              originalName: imageData.name,
              mimeType: getImageMimeType(imageData.fileName),
              size: 0,
              originalUrl: imageData.fileUrl,
              title: imageData.name,
              category: ImageCategory.AVATAR,
              uploaderId: user.id,
            }
          });

          await tx.guestImage.create({
            data: {
              guestId: id,
              imageId: createdImage.id,
              context: 'profile',
              sortOrder: i,
              isPrimary: i === 0,
            }
          });
        }
      }
    });

    revalidatePath('/admin/operations/guests');

    return {
      success: true,
      message: 'Guest updated successfully',
    };
  } catch (error) {
    console.error('Error updating guest:', error);
    return {
      success: false,
      message:
        error instanceof Error && error.message === 'User not authenticated'
          ? 'You must be logged in to update a guest'
          : 'Failed to update guest',
    };
  }
}

export async function deleteGuest(id: string): Promise<ActionResult> {
  try {
    await prisma.guest.delete({
      where: { id },
    });

    revalidatePath('/admin/operations/guests');

    return {
      success: true,
      message: 'Guest deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting guest:', error);
    return {
      success: false,
      message: 'Failed to delete guest',
    };
  }
}

export async function toggleGuestVipStatus(id: string, vipStatus: boolean): Promise<ActionResult> {
  try {
    await prisma.guest.update({
      where: { id },
      data: {
        vipStatus,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/operations/guests');

    return {
      success: true,
      message: `Guest ${vipStatus ? 'marked as VIP' : 'VIP status removed'} successfully`,
    };
  } catch (error) {
    console.error('Error toggling guest VIP status:', error);
    return {
      success: false,
      message: 'Failed to update guest VIP status',
    };
  }
}