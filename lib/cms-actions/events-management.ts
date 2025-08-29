'use server';

import { EventStatus, EventType } from '@prisma/client';
import { EventData } from '../actions/events';
import { prisma } from '../prisma';

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
}

export interface UpdateEventData extends CreateEventData {
  id: string;
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
    await prisma.event.create({
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
    await prisma.event.update({
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