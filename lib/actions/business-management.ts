'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { PropertyType } from '@prisma/client';
import { auth } from '@/auth'; // Import your auth function

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
    context: string | null;
    sortOrder: number;
    image: {
      id: string;
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
  // Add these for image handling
  propertyImages?: Array<{
    fileName: string;
    name: string;
    fileUrl: string;
  }>;
  removeImageIds?: string[]; // IDs of images to remove
}

// Helper function to get current user
async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  return session.user;
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
            context: true,
            sortOrder: true,
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
        images: {
          select: {
            id: true,
            isPrimary: true,
            context: true,
            sortOrder: true,
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
    // Get current user
    const user = await getCurrentUser();

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
      message: error instanceof Error && error.message === 'User not authenticated' 
        ? 'You must be logged in to create a business unit'
        : 'Failed to create business unit'
    };
  }
}

export async function updateBusinessUnit(data: UpdateBusinessUnitData): Promise<ActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser();

    // Start a transaction to handle both business unit update and image management
    await prisma.$transaction(async (tx) => {
      // Update the business unit
      await tx.businessUnit.update({
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

      // Handle image removal if specified
      if (data.removeImageIds && data.removeImageIds.length > 0) {
        // Remove the junction table entries
        await tx.businessUnitImage.deleteMany({
          where: {
            businessUnitId: data.id,
            imageId: {
              in: data.removeImageIds
            }
          }
        });

        // Optionally delete orphaned images
        for (const imageId of data.removeImageIds) {
          const imageUsageCount = await tx.businessUnitImage.count({
            where: { imageId: imageId }
          });

          // If the image is not used elsewhere, delete it
          if (imageUsageCount === 0) {
            await tx.image.delete({ 
              where: { id: imageId },
              // Add this to prevent errors if image doesn't exist
            }).catch(() => {
              // Ignore deletion errors for already deleted images
            });
          }
        }
      }

      // Handle new property images
      if (data.propertyImages && data.propertyImages.length > 0) {
        for (let i = 0; i < data.propertyImages.length; i++) {
          const imageData = data.propertyImages[i];
          
          // Create the Image record
          const createdImage = await tx.image.create({
            data: {
              filename: imageData.fileName,
              originalName: imageData.name,
              mimeType: getImageMimeType(imageData.fileName),
              size: 0, // You might want to get actual file size from your upload service
              originalUrl: imageData.fileUrl,
              title: imageData.name,
              category: 'PROPERTY_GALLERY',
              uploaderId: user.id, // Use actual authenticated user ID
            }
          });

          // Create the junction table entry
          await tx.businessUnitImage.create({
            data: {
              businessUnitId: data.id,
              imageId: createdImage.id,
              context: 'gallery',
              sortOrder: i,
              isPrimary: i === 0, // Make first image primary if no primary exists
            }
          });
        }
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
      message: error instanceof Error && error.message === 'User not authenticated' 
        ? 'You must be logged in to update a business unit'
        : 'Failed to update business unit'
    };
  }
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
      return 'image/jpeg'; // Default fallback
  }
}

// Helper function to create an image record and associate it with a business unit
export async function addBusinessUnitImage(
  businessUnitId: string, 
  imageData: {
    fileName: string;
    name: string;
    fileUrl: string;
    context?: string;
    isPrimary?: boolean;
  }
): Promise<ActionResult> {
  try {
    // Get current user
    const user = await getCurrentUser();

    await prisma.$transaction(async (tx) => {
      // Create the Image record
      const createdImage = await tx.image.create({
        data: {
          filename: imageData.fileName,
          originalName: imageData.name,
          mimeType: getImageMimeType(imageData.fileName),
          size: 0, // You might want to get actual file size
          originalUrl: imageData.fileUrl,
          title: imageData.name,
          category: 'PROPERTY_GALLERY',
          uploaderId: user.id, // Use actual authenticated user ID
        }
      });

      // Check if we need to update existing primary image
      if (imageData.isPrimary) {
        // Remove primary status from existing images
        await tx.businessUnitImage.updateMany({
          where: {
            businessUnitId: businessUnitId,
            isPrimary: true,
          },
          data: {
            isPrimary: false,
          }
        });
      }

      // Create the junction table entry
      await tx.businessUnitImage.create({
        data: {
          businessUnitId: businessUnitId,
          imageId: createdImage.id,
          context: imageData.context || 'gallery',
          sortOrder: 0,
          isPrimary: imageData.isPrimary || false,
        }
      });
    });

    revalidatePath('/admin/operations/properties');

    return {
      success: true,
      message: 'Image added successfully'
    };
  } catch (error) {
    console.error('Error adding business unit image:', error);
    return {
      success: false,
      message: error instanceof Error && error.message === 'User not authenticated' 
        ? 'You must be logged in to add images'
        : 'Failed to add image'
    };
  }
}

// Helper function to remove a business unit image
export async function removeBusinessUnitImage(
  businessUnitId: string, 
  imageId: string
): Promise<ActionResult> {
  try {
    // Get current user for authorization
    const user = await getCurrentUser();

    await prisma.$transaction(async (tx) => {
      // Remove the junction table entry
      await tx.businessUnitImage.deleteMany({
        where: {
          businessUnitId: businessUnitId,
          imageId: imageId
        }
      });

      // Check if this image is used elsewhere before deleting
      const imageUsageCount = await tx.businessUnitImage.count({
        where: { imageId: imageId }
      });

      // If the image is not used elsewhere, delete it
      if (imageUsageCount === 0) {
        await tx.image.delete({ 
          where: { id: imageId } 
        }).catch(() => {
          // Ignore deletion errors for already deleted images
        });
      }
    });

    revalidatePath('/admin/operations/properties');

    return {
      success: true,
      message: 'Image removed successfully'
    };
  } catch (error) {
    console.error('Error removing business unit image:', error);
    return {
      success: false,
      message: error instanceof Error && error.message === 'User not authenticated' 
        ? 'You must be logged in to remove images'
        : 'Failed to remove image'
    };
  }
}

export async function deleteBusinessUnit(id: string): Promise<ActionResult> {
  try {
    // Get current user for authorization
    const user = await getCurrentUser();

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
      message: error instanceof Error && error.message === 'User not authenticated' 
        ? 'You must be logged in to delete business units'
        : 'Failed to delete business unit'
    };
  }
}

export async function toggleBusinessUnitStatus(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    // Get current user for authorization
    const user = await getCurrentUser();

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
      message: error instanceof Error && error.message === 'User not authenticated' 
        ? 'You must be logged in to update business unit status'
        : 'Failed to update business unit status'
    };
  }
}

export async function toggleBusinessUnitFeatured(id: string, isFeatured: boolean): Promise<ActionResult> {
  try {
    // Get current user for authorization
    const user = await getCurrentUser();

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
      message: error instanceof Error && error.message === 'User not authenticated' 
        ? 'You must be logged in to update business unit featured status'
        : 'Failed to update business unit featured status'
    };
  }
}