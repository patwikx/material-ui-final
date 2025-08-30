'use server';

import { EventStatus, EventType } from '@prisma/client';
import { EventData } from '../actions/events';
import { prisma } from '../prisma';
import { auth } from '@/auth';

import { revalidatePath } from 'next/cache';

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export interface CreateEventData {
  title: string;
  slug: string;
  description: string;
  shortDesc: string;
  type: EventType;
  status: EventStatus;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  venue: string;
  venueDetails: string;
  venueCapacity: number | null;
  isFree: boolean;
  ticketPrice: number | null;
  currency: string;
  requiresBooking: boolean;
  maxAttendees: number | null;
  businessUnitId: string;
  isPublished: boolean;
  isFeatured: boolean;
  isPinned: boolean;
  sortOrder: number;
  eventImages?: Array<{
    fileName: string;
    name: string;
    fileUrl: string;
  }>;
  removeImageIds?: string[];
}

export interface UpdateEventData extends CreateEventData {
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

export async function getAllEvents(): Promise<EventData[]> {
  try {
    const events = await prisma.event.findMany({
      include: {
        businessUnit: {
          select: {
            id: true,
            name: true,
            displayName: true,
            city: true,
            country: true,
          }
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
                altText: true,
                caption: true,
              }
            }
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' }
          ]
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { isPinned: 'desc' },
        { startDate: 'desc' },
        { sortOrder: 'asc' }
      ]
    });

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      shortDesc: event.shortDesc,
      type: event.type,
      status: event.status,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      venue: event.venue,
      venueDetails: event.venueDetails,
      venueCapacity: event.venueCapacity,
      isFree: event.isFree,
      ticketPrice: event.ticketPrice ? Number(event.ticketPrice) : null,
      currency: event.currency,
      requiresBooking: event.requiresBooking,
      maxAttendees: event.maxAttendees,
      currentAttendees: event.currentAttendees,
      businessUnit: event.businessUnit,
      images: event.images
    }));
  } catch (error) {
    console.error('Error fetching all events:', error);
    return [];
  }
}

export async function getEventById(id: string): Promise<EventData | null> {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        businessUnit: {
          select: {
            id: true,
            name: true,
            displayName: true,
            city: true,
            country: true,
          }
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
                altText: true,
                caption: true,
              }
            }
          },
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' }
          ]
        }
      }
    });

    if (!event) return null;

    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      shortDesc: event.shortDesc,
      type: event.type,
      status: event.status,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      venue: event.venue,
      venueDetails: event.venueDetails,
      venueCapacity: event.venueCapacity,
      isFree: event.isFree,
      ticketPrice: event.ticketPrice ? Number(event.ticketPrice) : null,
      currency: event.currency,
      requiresBooking: event.requiresBooking,
      maxAttendees: event.maxAttendees,
      currentAttendees: event.currentAttendees,
      businessUnit: event.businessUnit,
      images: event.images
    };
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    return null;
  }
}

export async function createEvent(data: CreateEventData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    await prisma.$transaction(async (tx) => {
      // Create the event
      const createdEvent = await tx.event.create({
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          shortDesc: data.shortDesc || null,
          type: data.type,
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate,
          startTime: data.startTime || null,
          endTime: data.endTime || null,
          venue: data.venue,
          venueDetails: data.venueDetails || null,
          venueCapacity: data.venueCapacity,
          isFree: data.isFree,
          ticketPrice: data.ticketPrice,
          currency: data.currency,
          requiresBooking: data.requiresBooking,
          maxAttendees: data.maxAttendees,
          businessUnitId: data.businessUnitId,
          isPublished: data.isPublished,
          isFeatured: data.isFeatured,
          isPinned: data.isPinned,
          sortOrder: data.sortOrder,
          currentAttendees: 0,
        }
      });

      // Handle event images
      if (data.eventImages && data.eventImages.length > 0) {
        for (let i = 0; i < data.eventImages.length; i++) {
          const imageData = data.eventImages[i];
          
          // Create the Image record
          const createdImage = await tx.image.create({
            data: {
              filename: imageData.fileName,
              originalName: imageData.name,
              mimeType: getImageMimeType(imageData.fileName),
              size: 0,
              originalUrl: imageData.fileUrl,
              title: imageData.name,
              category: 'EVENT',
              uploaderId: user.id,
            }
          });

          // Create the junction table entry
          await tx.eventImage.create({
            data: {
              eventId: createdEvent.id,
              imageId: createdImage.id,
              context: 'gallery',
              sortOrder: i,
              isPrimary: i === 0,
            }
          });
        }
      }
    });

    revalidatePath('/admin/cms/events');
    revalidatePath('/');

    return {
      success: true,
      message: 'Event created successfully'
    };
  } catch (error) {
    console.error('Error creating event:', error);
    return {
      success: false,
      message: 'Failed to create event'
    };
  }
}

export async function updateEvent(data: UpdateEventData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();

    await prisma.$transaction(async (tx) => {
      // Update the event
      await tx.event.update({
        where: { id: data.id },
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          shortDesc: data.shortDesc || null,
          type: data.type,
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate,
          startTime: data.startTime || null,
          endTime: data.endTime || null,
          venue: data.venue,
          venueDetails: data.venueDetails || null,
          venueCapacity: data.venueCapacity,
          isFree: data.isFree,
          ticketPrice: data.ticketPrice,
          currency: data.currency,
          requiresBooking: data.requiresBooking,
          maxAttendees: data.maxAttendees,
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
        await tx.eventImage.deleteMany({
          where: {
            eventId: data.id,
            imageId: {
              in: data.removeImageIds
            }
          }
        });

        for (const imageId of data.removeImageIds) {
          const imageUsageCount = await tx.eventImage.count({
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

      // Handle new event images
      if (data.eventImages && data.eventImages.length > 0) {
        for (let i = 0; i < data.eventImages.length; i++) {
          const imageData = data.eventImages[i];
          
          // Create the Image record
          const createdImage = await tx.image.create({
            data: {
              filename: imageData.fileName,
              originalName: imageData.name,
              mimeType: getImageMimeType(imageData.fileName),
              size: 0,
              originalUrl: imageData.fileUrl,
              title: imageData.name,
              category: 'EVENT',
              uploaderId: user.id,
            }
          });

          // Create the junction table entry
          await tx.eventImage.create({
            data: {
              eventId: data.id,
              imageId: createdImage.id,
              context: 'gallery',
              sortOrder: i,
              isPrimary: i === 0,
            }
          });
        }
      }
    });

    revalidatePath('/admin/cms/events');
    revalidatePath('/');

    return {
      success: true,
      message: 'Event updated successfully'
    };
  } catch (error) {
    console.error('Error updating event:', error);
    return {
      success: false,
      message: 'Failed to update event'
    };
  }
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  try {
    await prisma.event.delete({
      where: { id }
    });

    revalidatePath('/admin/cms/events');
    revalidatePath('/');

    return {
      success: true,
      message: 'Event deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting event:', error);
    return {
      success: false,
      message: 'Failed to delete event'
    };
  }
}

export async function toggleEventStatus(id: string, isPublished: boolean): Promise<ActionResult> {
  try {
    await prisma.event.update({
      where: { id },
      data: { 
        isPublished,
        updatedAt: new Date()
      }
    });

    revalidatePath('/admin/cms/events');
    revalidatePath('/');

    return {
      success: true,
      message: `Event ${isPublished ? 'published' : 'unpublished'} successfully`
    };
  } catch (error) {
    console.error('Error toggling event status:', error);
    return {
      success: false,
      message: 'Failed to update event status'
    };
  }
}

export async function toggleEventFeatured(id: string, isFeatured: boolean): Promise<ActionResult> {
  try {
    await prisma.event.update({
      where: { id },
      data: { 
        isFeatured,
        updatedAt: new Date()
      }
    });

    revalidatePath('/admin/cms/events');
    revalidatePath('/');

    return {
      success: true,
      message: `Event ${isFeatured ? 'featured' : 'unfeatured'} successfully`
    };
  } catch (error) {
    console.error('Error toggling event featured status:', error);
    return {
      success: false,
      message: 'Failed to update event featured status'
    };
  }
}