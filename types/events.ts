// lib/types/prisma.ts
// These types should match your Prisma generated types

export interface BusinessUnit {
  id: string;
  name: string;
  displayName: string;
  city: string;
  country: string;
}

export interface EventImage {
  id: string;
  originalUrl: string;
  thumbnailUrl: string | null;
  mediumUrl: string | null;
  largeUrl: string | null;
  title: string | null;
  altText: string | null;
  caption: string | null;
}

export interface EventImageRelation {
  id: string;
  image: EventImage;
  context: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface PrismaEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  type: EventType;
  status: EventStatus;
  startDate: Date;
  endDate: Date;
  startTime: string | null;
  endTime: string | null;
  venue: string;
  venueDetails: string | null;
  venueCapacity: number | null;
  isFree: boolean;
  ticketPrice: Decimal | null;
  currency: string;
  requiresBooking: boolean;
  maxAttendees: number | null;
  currentAttendees: number;
  businessUnit: BusinessUnit | null;
  images: EventImageRelation[];
}

export type EventType = 
  | 'WEDDING'
  | 'CONFERENCE'
  | 'MEETING'
  | 'WORKSHOP'
  | 'CELEBRATION'
  | 'CULTURAL'
  | 'SEASONAL'
  | 'ENTERTAINMENT'
  | 'CORPORATE'
  | 'PRIVATE';

export type EventStatus = 
  | 'PLANNING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'POSTPONED';

// Decimal type from Prisma
export type Decimal = {
  toString(): string;
  toNumber(): number;
};