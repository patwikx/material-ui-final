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

// Debug function to check what's in your database
export const debugEvents = async () => {
  try {
    console.log('🔍 Starting events debug...');
    
    // Check total events in database
    const totalEvents = await prisma.event.count();
    console.log('📊 Total events in database:', totalEvents);

    // Check published events
    const publishedEvents = await prisma.event.count({
      where: { isPublished: true }
    });
    console.log('📊 Published events:', publishedEvents);

    // Check events with future dates
    const currentDate = new Date();
    console.log('📅 Current date:', currentDate.toISOString());
    
    const futureEvents = await prisma.event.count({
      where: {
        startDate: { gte: currentDate }
      }
    });
    console.log('📊 Future events:', futureEvents);

    // Check events that meet both criteria
    const validEvents = await prisma.event.count({
      where: {
        isPublished: true,
        startDate: { gte: currentDate }
      }
    });
    console.log('📊 Published future events (valid):', validEvents);

    // Get sample events with details for debugging
    const sampleEvents = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        isPublished: true,
        startDate: true,
        status: true,
        businessUnitId: true,
      },
      take: 10
    });
    
    console.log('📋 Sample events:');
    sampleEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   - Published: ${event.isPublished}`);
      console.log(`   - Start Date: ${event.startDate.toISOString()}`);
      console.log(`   - Is Future: ${event.startDate >= currentDate}`);
      console.log(`   - Status: ${event.status}`);
      console.log(`   - Business Unit ID: ${event.businessUnitId}`);
      console.log('   ---');
    });

    return {
      totalEvents,
      publishedEvents,
      futureEvents,
      validEvents,
      sampleEvents,
      currentDate
    };
  } catch (error) {
    console.error('❌ Debug error:', error);
    throw error;
  }
};

// Get all events for debugging (less restrictive)
export const getAllEventsForDebug = async () => {
  try {
    console.log('🔍 Fetching ALL events (no filters)...');
    
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        startDate: true,
        endDate: true,
        status: true,
        businessUnitId: true,
        isFree: true,
        ticketPrice: true,
        venue: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });
    
    console.log('📊 Found', events.length, 'total events');
    return events;
  } catch (error) {
    console.error('❌ Error in getAllEventsForDebug:', error);
    throw error;
  }
};

// Cache the function for better performance
export const getPublishedEvents = cache(async (
  limit?: number
): Promise<EventData[]> => {
  try {
    console.log('🔍 Fetching published events...');
    console.log('📅 Current date:', new Date().toISOString());
    console.log('🎯 Criteria: isPublished = true, startDate >= now');
    if (limit) console.log('📊 Limit:', limit);

    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
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
        { isFeatured: 'desc' }, 
        { isPinned: 'desc' },
        { startDate: 'asc' },
        { sortOrder: 'asc' }
      ],
      ...(limit && { take: limit })
    });

    console.log('✅ Found', events.length, 'published future events');
    
    if (events.length === 0) {
      console.log('❌ No events found. Possible reasons:');
      console.log('   1. No events in database');
      console.log('   2. No events with isPublished = true');
      console.log('   3. All events have past startDate');
      console.log('   4. Database connection issues');
      console.log('💡 Run debugEvents() to investigate');
    }

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
    console.error('❌ Error fetching events:', error);
    console.error('Error details:', error);
    throw new Error('Failed to fetch events');
  }
});

// Alternative less restrictive version for testing
export const getPublishedEventsLessRestrictive = cache(async (
  limit?: number
): Promise<EventData[]> => {
  try {
    console.log('🔍 Fetching events with LESS restrictive criteria...');
    
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        // Removed date filter for testing
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
        { isFeatured: 'desc' }, 
        { isPinned: 'desc' },
        { startDate: 'asc' },
        { sortOrder: 'asc' }
      ],
      ...(limit && { take: limit })
    });

    console.log('✅ Found', events.length, 'published events (any date)');

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
    console.error('❌ Error fetching events (less restrictive):', error);
    throw new Error('Failed to fetch events');
  }
});

export const getFeaturedEvents = cache(async (limit: number = 6): Promise<EventData[]> => {
  try {
    console.log('🔍 Fetching featured events...');
    
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

    console.log('✅ Found', events.length, 'featured events');

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
    console.error('❌ Error fetching featured events:', error);
    throw new Error('Failed to fetch featured events');
  }
});

export const getEventBySlug = cache(async (slug: string, businessUnitId?: string): Promise<EventData | null> => {
  try {
    console.log('🔍 Fetching event by slug:', slug);
    if (businessUnitId) console.log('🏢 Business Unit ID:', businessUnitId);

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

    if (!event) {
      console.log('❌ No event found with slug:', slug);
      return null;
    }

    console.log('✅ Found event:', event.title);

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
    console.error('❌ Error fetching event by slug:', error);
    throw new Error('Failed to fetch event');
  }
});

// Get events by business unit
export const getEventsByBusinessUnit = cache(async (
  businessUnitId: string,
  limit?: number
): Promise<EventData[]> => {
  try {
    console.log('🔍 Fetching events for business unit:', businessUnitId);

    const events = await prisma.event.findMany({
      where: {
        businessUnitId: businessUnitId,
        isPublished: true,
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
        { isFeatured: 'desc' },
        { isPinned: 'desc' },
        { startDate: 'asc' },
        { sortOrder: 'asc' }
      ],
      ...(limit && { take: limit })
    });

    console.log('✅ Found', events.length, 'events for business unit');

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
    console.error('❌ Error fetching events by business unit:', error);
    throw new Error('Failed to fetch events by business unit');
  }
});


// Create a sample event for testing (use this to add test data)
export const createSampleEvent = async (businessUnitId: string) => {
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now

    const endDate = new Date(futureDate);
    endDate.setHours(endDate.getHours() + 3); // 3 hours later

    const sampleEvent = await prisma.event.create({
      data: {
        businessUnitId: businessUnitId,
        title: 'Sample Wedding Reception',
        slug: 'sample-wedding-reception',
        description: 'Join us for an elegant wedding reception featuring fine dining, live music, and dancing under the stars. This exclusive event showcases our premium event hosting capabilities.',
        shortDesc: 'Elegant wedding reception with fine dining and live entertainment.',
        type: 'WEDDING',
        status: 'CONFIRMED',
        startDate: futureDate,
        endDate: endDate,
        startTime: '18:00',
        endTime: '23:00',
        venue: 'Grand Ballroom',
        venueDetails: 'Our stunning grand ballroom with panoramic city views',
        venueCapacity: 200,
        isFree: false,
        ticketPrice: 150.00,
        currency: 'USD',
        requiresBooking: true,
        maxAttendees: 150,
        currentAttendees: 0,
        isPublished: true,
        isFeatured: true,
        isPinned: false,
        sortOrder: 0,
        publishedAt: new Date(),
      }
    });

    console.log('✅ Created sample event:', sampleEvent.title);
    return sampleEvent;
  } catch (error) {
    console.error('❌ Error creating sample event:', error);
    throw error;
  }
};