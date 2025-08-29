'use server';

import { prisma } from '@/lib/prisma';
import { cache } from 'react';

export interface WebsiteConfigData {
  siteName: string;
  tagline: string | null;
  logo: string | null;
  primaryPhone: string | null;
  primaryEmail: string | null;
}

export const getWebsiteConfiguration = cache(async (): Promise<WebsiteConfigData | null> => {
  try {
    const config = await prisma.websiteConfiguration.findFirst({
      select: {
        siteName: true,
        tagline: true,
        logo: true,
        primaryPhone: true,
        primaryEmail: true,
      },
    });

    return config;
  } catch (error) {
    console.error('Error fetching website configuration:', error);
    return null;
  }
});