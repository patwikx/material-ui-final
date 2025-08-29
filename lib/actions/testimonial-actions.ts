'use server';

import { TestimonialData } from '../actions/testimonials';
import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export interface CreateTestimonialData {
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

export interface UpdateTestimonialData extends CreateTestimonialData {
  id: string;
}

export async function getAllTestimonials(): Promise<TestimonialData[]> {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { reviewDate: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return testimonials;
  } catch (error) {
    console.error('Error fetching all testimonials:', error);
    return [];
  }
}

export async function getTestimonialById(id: string): Promise<TestimonialData | null> {
  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    return testimonial;
  } catch (error) {
    console.error('Error fetching testimonial by ID:', error);
    return null;
  }
}

export async function createTestimonial(data: CreateTestimonialData): Promise<ActionResult> {
  try {
    await prisma.testimonial.create({
      data: {
        guestName: data.guestName,
        guestTitle: data.guestTitle,
        guestImage: data.guestImage,
        guestCountry: data.guestCountry,
        content: data.content,
        rating: data.rating,
        source: data.source,
        sourceUrl: data.sourceUrl,
        stayDate: data.stayDate,
        reviewDate: data.reviewDate,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
      }
    });

    revalidatePath('/admin/cms/testimonials');
    revalidatePath('/');

    return {
      success: true,
      message: 'Testimonial created successfully'
    };
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return {
      success: false,
      message: 'Failed to create testimonial'
    };
  }
}

export async function updateTestimonial(data: UpdateTestimonialData): Promise<ActionResult> {
  try {
    await prisma.testimonial.update({
      where: { id: data.id },
      data: {
        guestName: data.guestName,
        guestTitle: data.guestTitle,
        guestImage: data.guestImage,
        guestCountry: data.guestCountry,
        content: data.content,
        rating: data.rating,
        source: data.source,
        sourceUrl: data.sourceUrl,
        stayDate: data.stayDate,
        reviewDate: data.reviewDate,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
        updatedAt: new Date(),
      }
    });

    revalidatePath('/admin/cms/testimonials');
    revalidatePath('/');

    return {
      success: true,
      message: 'Testimonial updated successfully'
    };
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return {
      success: false,
      message: 'Failed to update testimonial'
    };
  }
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  try {
    await prisma.testimonial.delete({
      where: { id }
    });

    revalidatePath('/admin/cms/testimonials');
    revalidatePath('/');

    return {
      success: true,
      message: 'Testimonial deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return {
      success: false,
      message: 'Failed to delete testimonial'
    };
  }
}

export async function toggleTestimonialStatus(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    await prisma.testimonial.update({
      where: { id },
      data: { 
        isActive,
        updatedAt: new Date()
      }
    });

    revalidatePath('/admin/cms/testimonials');
    revalidatePath('/');

    return {
      success: true,
      message: `Testimonial ${isActive ? 'activated' : 'deactivated'} successfully`
    };
  } catch (error) {
    console.error('Error toggling testimonial status:', error);
    return {
      success: false,
      message: 'Failed to update testimonial status'
    };
  }
}

export async function toggleTestimonialFeatured(id: string, isFeatured: boolean): Promise<ActionResult> {
  try {
    await prisma.testimonial.update({
      where: { id },
      data: { 
        isFeatured,
        updatedAt: new Date()
      }
    });

    revalidatePath('/admin/cms/testimonials');
    revalidatePath('/');

    return {
      success: true,
      message: `Testimonial ${isFeatured ? 'featured' : 'unfeatured'} successfully`
    };
  } catch (error) {
    console.error('Error toggling testimonial featured status:', error);
    return {
      success: false,
      message: 'Failed to update testimonial featured status'
    };
  }
}