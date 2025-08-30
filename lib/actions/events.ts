// lib/actions/events.ts
'use server';

import { PrismaClient } from '@prisma/client';
import { cache } from 'react';

const prisma = new PrismaClient();

export interface EventData {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  type: string;
  status: string;
  startDate: Date;
  endDate: Date;
  startTime: string | null;
  endTime: string | null;
  venue: string;
  venueDetails: string | null;
  venueCapacity: number | null;
  isFree: boolean;
  ticketPrice: number | null;
  currency: string;
  requiresBooking: boolean;
  maxAttendees: number | null;
  currentAttendees: number;
  businessUnit: {
    id: string;
    name: string;
    displayName: string;
    city: string;
    country: string;
  } | null;
  images: Array<{
    id: string;
    image: {
      id: string;
      originalUrl: string;
      thumbnailUrl: string | null;
      mediumUrl: string | null;
      largeUrl: string | null;
      title: string | null;
      altText: string | null;
      caption: string | null;
    };
    context: string | null;
    isPrimary: boolean;
    sortOrder: number;
  }>;
}

// Cache the function for better performance
export const getPublishedEvents = cache(async (
  businessUnitId?: string,
  limit?: number
): Promise<EventData[]> => {
  try {
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS']
        },
        startDate: {
          gte: new Date() // Only future events
        },
        ...(businessUnitId && {
          businessUnitId: businessUnitId
        })
      },
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
        { isFeatured: 'desc' }, // This will still prioritize featured events at the top
        { isPinned: 'desc' },
        { startDate: 'asc' },
        { sortOrder: 'asc' }
      ],
      ...(limit && { take: limit })
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
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events');
  }
});


export const getFeaturedEvents = cache(async (limit: number = 6): Promise<EventData[]> => {
  try {
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        isFeatured: true,
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS']
        },
        startDate: {
          gte: new Date()
        }
      },
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
        { isPinned: 'desc' },
        { startDate: 'asc' },
        { sortOrder: 'asc' }
      ],
      take: limit
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
    console.error('Error fetching featured events:', error);
    throw new Error('Failed to fetch featured events');
  }
});

export const getEventBySlug = cache(async (slug: string, businessUnitId?: string): Promise<EventData | null> => {
  try {
    const event = await prisma.event.findFirst({
      where: {
        slug: slug,
        isPublished: true,
        ...(businessUnitId && {
          businessUnitId: businessUnitId
        })
      },
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
    console.error('Error fetching event by slug:', error);
    throw new Error('Failed to fetch event');
  }
});