'use server';

import { HeroData } from '../actions/heroes';
import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export interface UpdateHeroData {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  backgroundImage: string;
  backgroundVideo: string;
  overlayImage: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  displayType: string;
  textAlignment: string;
  overlayColor: string;
  overlayOpacity: number;
  textColor: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  primaryButtonStyle: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  secondaryButtonStyle: string;
  showFrom: Date | null;
  showUntil: Date | null;
  targetPages: string[];
  targetAudience: string[];
  altText: string;
  caption: string;
}

export async function getAllHeroes(): Promise<HeroData[]> {
  try {
    const heroes = await prisma.hero.findMany({
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
    console.error('Error fetching all heroes:', error);
    return [];
  }
}

export async function getHeroById(id: string): Promise<HeroData | null> {
  try {
    const hero = await prisma.hero.findUnique({
      where: { id }
    });

    if (!hero) return null;

    return {
      ...hero,
      overlayOpacity: hero.overlayOpacity ? Number(hero.overlayOpacity) : null
    };
  } catch (error) {
    console.error('Error fetching hero by ID:', error);
    return null;
  }
}

export async function updateHeroSlide(id: string, data: UpdateHeroData): Promise<ActionResult> {
  try {
    await prisma.hero.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle || null,
        description: data.description || null,
        buttonText: data.buttonText || null,
        buttonUrl: data.buttonUrl || null,
        backgroundImage: data.backgroundImage || null,
        backgroundVideo: data.backgroundVideo || null,
        overlayImage: data.overlayImage || null,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
        displayType: data.displayType,
        textAlignment: data.textAlignment || null,
        overlayColor: data.overlayColor || null,
        overlayOpacity: data.overlayOpacity || null,
        textColor: data.textColor || null,
        primaryButtonText: data.primaryButtonText || null,
        primaryButtonUrl: data.primaryButtonUrl || null,
        primaryButtonStyle: data.primaryButtonStyle || null,
        secondaryButtonText: data.secondaryButtonText || null,
        secondaryButtonUrl: data.secondaryButtonUrl || null,
        secondaryButtonStyle: data.secondaryButtonStyle || null,
        showFrom: data.showFrom,
        showUntil: data.showUntil,
        targetPages: data.targetPages,
        targetAudience: data.targetAudience,
        altText: data.altText || null,
        caption: data.caption || null,
        updatedAt: new Date(),
      }
    });

    revalidatePath('/admin/cms/hero');
    revalidatePath('/');

    return {
      success: true,
      message: 'Hero slide updated successfully'
    };
  } catch (error) {
    console.error('Error updating hero slide:', error);
    return {
      success: false,
      message: 'Failed to update hero slide'
    };
  }
}

export async function deleteHeroSlide(id: string): Promise<ActionResult> {
  try {
    await prisma.hero.delete({
      where: { id }
    });

    revalidatePath('/admin/cms/hero');
    revalidatePath('/');

    return {
      success: true,
      message: 'Hero slide deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    return {
      success: false,
      message: 'Failed to delete hero slide'
    };
  }
}

export async function toggleHeroStatus(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    await prisma.hero.update({
      where: { id },
      data: { 
        isActive,
        updatedAt: new Date()
      }
    });

    revalidatePath('/admin/cms/hero');
    revalidatePath('/');

    return {
      success: true,
      message: `Hero slide ${isActive ? 'activated' : 'deactivated'} successfully`
    };
  } catch (error) {
    console.error('Error toggling hero status:', error);
    return {
      success: false,
      message: 'Failed to update hero status'
    };
  }
}

export async function toggleHeroFeatured(id: string, isFeatured: boolean): Promise<ActionResult> {
  try {
    await prisma.hero.update({
      where: { id },
      data: { 
        isFeatured,
        updatedAt: new Date()
      }
    });

    revalidatePath('/admin/cms/hero');
    revalidatePath('/');

    return {
      success: true,
      message: `Hero slide ${isFeatured ? 'featured' : 'unfeatured'} successfully`
    };
  } catch (error) {
    console.error('Error toggling hero featured status:', error);
    return {
      success: false,
      message: 'Failed to update hero featured status'
    };
  }
}