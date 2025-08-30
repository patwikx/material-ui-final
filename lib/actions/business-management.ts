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

        // Optionally, you might want to delete the actual Image records
        // if they're no longer used elsewhere. This requires additional logic
        // to check if the image is used by other entities.
      }

      // Handle new property images
      if (data.propertyImages && data.propertyImages.length > 0) {
        // First, we need a user ID for the uploader. You might need to pass this in the data
        // For now, I'll assume you have a way to get the current user ID
        // This is a placeholder - you'll need to implement proper user context
        const uploaderUserId = 'placeholder-user-id'; // TODO: Get actual user ID
        
        for (let i = 0; i < data.propertyImages.length; i++) {
          const imageData = data.propertyImages[i];
          
          // Create the Image record
          const createdImage = await tx.image.create({
            data: {
              filename: imageData.fileName,
              originalName: imageData.name,
              mimeType: 'image/jpeg', // You might want to detect this from the file
              size: 0, // You might want to get actual file size
              originalUrl: imageData.fileUrl,
              title: imageData.name,
              category: 'PROPERTY_GALLERY',
              uploaderId: uploaderUserId,
            }
          });

          // Create the junction table entry
          await tx.businessUnitImage.create({
            data: {
              businessUnitId: data.id,
              imageId: createdImage.id,
              context: 'gallery',
              sortOrder: i,
              isPrimary: i === 0, // Make first image primary
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
      message: 'Failed to update business unit'
    };
  }
}

// Helper function to create an image record and associate it with a business unit
export async function addBusinessUnitImage(
  businessUnitId: string, 
  imageData: {
    fileName: string;
    name: string;
    fileUrl: string;
    uploaderId: string;
    context?: string;
    isPrimary?: boolean;
  }
): Promise<ActionResult> {
  try {
    await prisma.$transaction(async (tx) => {
      // Create the Image record
      const createdImage = await tx.image.create({
        data: {
          filename: imageData.fileName,
          originalName: imageData.name,
          mimeType: 'image/jpeg', // You might want to detect this properly
          size: 0, // You might want to get actual file size
          originalUrl: imageData.fileUrl,
          title: imageData.name,
          category: 'PROPERTY_GALLERY',
          uploaderId: imageData.uploaderId,
        }
      });

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
      message: 'Failed to add image'
    };
  }
}

// Helper function to remove a business unit image
export async function removeBusinessUnitImage(
  businessUnitId: string, 
  imageId: string
): Promise<ActionResult> {
  try {
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

      // If the image is not used elsewhere, you could delete it
      // But be careful - you might want to keep it for audit purposes
      if (imageUsageCount === 0) {
        // Optionally delete the image record
        // await tx.image.delete({ where: { id: imageId } });
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
      message: 'Failed to remove image'
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