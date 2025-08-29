// lib/actions/faqs.ts
'use server';

import { prisma } from '../prisma';
import { cache } from 'react';

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

export const getPublishedFAQs = cache(async (): Promise<FAQData[]> => {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
     
        { sortOrder: 'asc' },
        { category: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return faqs;
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
});

export const getFeaturedFAQs = cache(async (limit: number = 10): Promise<FAQData[]> => {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: {
        isActive: true,
    
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return faqs;
  } catch (error) {
    console.error('Error fetching featured FAQs:', error);
    return [];
  }
});

export const getFAQsByCategory = cache(async (category: string): Promise<FAQData[]> => {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: {
        isActive: true,
        category: category,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return faqs;
  } catch (error) {
    console.error('Error fetching FAQs by category:', error);
    return [];
  }
});