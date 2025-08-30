'use server';

import { prisma } from '../prisma';
import { cache } from 'react';
import { Hero as PrismaHero } from '@prisma/client';

export interface HeroData {
  id: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
  backgroundImage: string | null;
  backgroundVideo: string | null;
  overlayImage: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  displayType: string;
  textAlignment: string | null;
  overlayColor: string | null;
  overlayOpacity: number | null;
  textColor: string | null;
  primaryButtonText: string | null;
  primaryButtonUrl: string | null;
  primaryButtonStyle: string | null;
  secondaryButtonText: string | null;
  secondaryButtonUrl: string | null;
  secondaryButtonStyle: string | null;
  showFrom: Date | null;
  showUntil: Date | null;
  targetPages: string[];
  targetAudience: string[];
  altText: string | null;
  caption: string | null;
  viewCount: number;
  clickCount: number;
  conversionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Simplified mapping function - URLs are already complete from file upload
const mapPrismaHeroToHeroData = (hero: PrismaHero): HeroData => {
  return {
    ...hero,
    // Convert Decimal types to number for client components
    overlayOpacity: hero.overlayOpacity ? Number(hero.overlayOpacity) : null,
    // Ensure array fields are handled
    targetPages: (hero.targetPages || []) as string[],
    targetAudience: (hero.targetAudience || []) as string[],
  };
};

export const getActiveHeroes = cache(async (targetPage: string = 'homepage'): Promise<HeroData[]> => {
  try {
    const now = new Date();
    
    const heroes = await prisma.hero.findMany({
      where: {
        isActive: true,
        targetPages: {
          hasSome: [targetPage, 'all']
        },
        OR: [
          {
            showFrom: null,
            showUntil: null
          },
          {
            showFrom: {
              lte: now
            },
            showUntil: {
              gte: now
            }
          },
          {
            showFrom: {
              lte: now
            },
            showUntil: null
          },
          {
            showFrom: null,
            showUntil: {
              gte: now
            }
          }
        ]
      },
      orderBy: [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return heroes.map(hero => mapPrismaHeroToHeroData(hero));

  } catch (error) {
    console.error('Error fetching heroes:', error);
    return [];
  }
});

export const getFeaturedHero = cache(async (targetPage: string = 'homepage'): Promise<HeroData | null> => {
  try {
    const now = new Date();
    
    const hero = await prisma.hero.findFirst({
      where: {
        isActive: true,
        isFeatured: true,
        targetPages: {
          hasSome: [targetPage, 'all']
        },
        OR: [
          {
            showFrom: null,
            showUntil: null
          },
          {
            showFrom: {
              lte: now
            },
            showUntil: {
              gte: now
            }
          },
          {
            showFrom: {
              lte: now
            },
            showUntil: null
          },
          {
            showFrom: null,
            showUntil: {
              gte: now
            }
          }
        ]
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    if (!hero) return null;

    return mapPrismaHeroToHeroData(hero);

  } catch (error) {
    console.error('Error fetching featured hero:', error);
    return null;
  }
});

export async function incrementHeroView(heroId: string): Promise<void> {
  try {
    await prisma.hero.update({
      where: { id: heroId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });
  } catch (error) {
    console.error('Error incrementing hero view count:', error);
  }
}

export async function incrementHeroClick(heroId: string): Promise<void> {
  try {
    await prisma.hero.update({
      where: { id: heroId },
      data: {
        clickCount: {
          increment: 1
        }
      }
    });
  } catch (error) {
    console.error('Error incrementing hero click count:', error);
  }
}