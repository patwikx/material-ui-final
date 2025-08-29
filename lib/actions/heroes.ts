// lib/actions/heroes.ts

'use server'

import { prisma } from "../prisma"

export interface HeroData {
  id: string;
  title: string;
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

export async function getActiveHeroes(targetPage: string = 'homepage'): Promise<HeroData[]> {
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

    return heroes.map(hero => ({
      ...hero,
      overlayOpacity: hero.overlayOpacity ? Number(hero.overlayOpacity) : null
    }));
  } catch (error) {
    console.error('Error fetching heroes:', error);
    return [];
  }
}

export async function getFeaturedHero(targetPage: string = 'homepage'): Promise<HeroData | null> {
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

    return {
      ...hero,
      overlayOpacity: hero.overlayOpacity ? Number(hero.overlayOpacity) : null
    };
  } catch (error) {
    console.error('Error fetching featured hero:', error);
    return null;
  }
}


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