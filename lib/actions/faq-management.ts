'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export interface FAQData {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFAQData {
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

export interface UpdateFAQData extends CreateFAQData {
  id: string;
}

export async function getAllFAQs(): Promise<FAQData[]> {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { category: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return faqs;
  } catch (error) {
    console.error('Error fetching all FAQs:', error);
    return [];
  }
}

export async function getFAQById(id: string): Promise<FAQData | null> {
  try {
    const faq = await prisma.fAQ.findUnique({
      where: { id },
    });

    return faq;
  } catch (error) {
    console.error('Error fetching FAQ by ID:', error);
    return null;
  }
}

export async function createFAQ(data: CreateFAQData): Promise<ActionResult> {
  try {
    await prisma.fAQ.create({
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      }
    });

    revalidatePath('/admin/cms/faqs');
    revalidatePath('/');

    return {
      success: true,
      message: 'FAQ created successfully'
    };
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return {
      success: false,
      message: 'Failed to create FAQ'
    };
  }
}

export async function updateFAQ(data: UpdateFAQData): Promise<ActionResult> {
  try {
    await prisma.fAQ.update({
      where: { id: data.id },
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        updatedAt: new Date(),
      }
    });

    revalidatePath('/admin/cms/faqs');
    revalidatePath('/');

    return {
      success: true,
      message: 'FAQ updated successfully'
    };
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return {
      success: false,
      message: 'Failed to update FAQ'
    };
  }
}

export async function deleteFAQ(id: string): Promise<ActionResult> {
  try {
    await prisma.fAQ.delete({
      where: { id }
    });

    revalidatePath('/admin/cms/faqs');
    revalidatePath('/');

    return {
      success: true,
      message: 'FAQ deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return {
      success: false,
      message: 'Failed to delete FAQ'
    };
  }
}

export async function toggleFAQStatus(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    await prisma.fAQ.update({
      where: { id },
      data: {
        isActive,
        updatedAt: new Date()
      }
    });

    revalidatePath('/admin/cms/faqs');
    revalidatePath('/');

    return {
      success: true,
      message: `FAQ ${isActive ? 'activated' : 'deactivated'} successfully`
    };
  } catch (error) {
    console.error('Error toggling FAQ status:', error);
    return {
      success: false,
      message: 'Failed to update FAQ status'
    };
  }
}

// REMOVED: toggleFAQFeatured function as FAQ model does not have isFeatured
// Your original code had this, but it is not supported by your schema.
// If you add an isFeatured field to your schema, you can add it back.