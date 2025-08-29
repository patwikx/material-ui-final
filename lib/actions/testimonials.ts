// lib/actions/testimonials.ts
'use server';

import { prisma } from '../prisma'; // Adjust the import path based on your setup

export interface TestimonialData {
  id: string;
  guestName: string;
  guestTitle: string | null;
  guestImage: string | null;
  guestCountry: string | null;
  content: string;
  rating: number | null;
  source: string | null;
  sourceUrl: string | null;
  stayDate: Date | null;
  reviewDate: Date | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export async function getFeaturedTestimonials(limit: number = 6): Promise<TestimonialData[]> {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { reviewDate: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return testimonials;
  } catch (error) {
    console.error('Error fetching featured testimonials:', error);
    return [];
  }
}

export async function getTestimonialsByProperty(
  businessUnitId: string, 
  limit: number = 10
): Promise<TestimonialData[]> {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: {
        isActive: true,
        properties: {
          some: {
            propertyId: businessUnitId,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { reviewDate: 'desc' },
      ],
      take: limit,
    });

    return testimonials;
  } catch (error) {
    console.error(`Error fetching testimonials for property ${businessUnitId}:`, error);
    return [];
  }
}

export async function getAllActiveTestimonials(limit?: number): Promise<TestimonialData[]> {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { reviewDate: 'desc' },
        { createdAt: 'desc' },
      ],
      ...(limit && { take: limit }),
    });

    return testimonials;
  } catch (error) {
    console.error('Error fetching active testimonials:', error);
    return [];
  }
}