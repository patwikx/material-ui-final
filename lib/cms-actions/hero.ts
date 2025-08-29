'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'


const prisma = new PrismaClient()

// Zod schema matching Hero model exactly
const createHeroSchema = z.object({
  // Content
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
  
  // Media
  backgroundImage: z.string().url("Invalid image URL").optional().or(z.literal("")),
  backgroundVideo: z.string().url("Invalid video URL").optional().or(z.literal("")),
  overlayImage: z.string().url("Invalid overlay image URL").optional().or(z.literal("")),
  
  // Display Settings
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
  displayType: z.enum(["fullscreen", "banner", "carousel"]).default("fullscreen"),
  
  // Styling Options
  textAlignment: z.enum(["left", "center", "right"]).default("center"),
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().min(0).max(1).optional(),
  textColor: z.string().optional(),
  
  // Call-to-Action
  primaryButtonText: z.string().optional(),
  primaryButtonUrl: z.string().optional(),
  primaryButtonStyle: z.string().optional(),
  secondaryButtonText: z.string().optional(),
  secondaryButtonUrl: z.string().optional(),
  secondaryButtonStyle: z.string().optional(),
  
  // Scheduling
  showFrom: z.string().optional(),
  showUntil: z.string().optional(),
  
  // Targeting
  targetPages: z.array(z.string()).optional(),
  targetAudience: z.array(z.string()).optional(),
  
  // SEO
  altText: z.string().optional(),
  caption: z.string().optional()
})

export type CreateHeroInput = z.infer<typeof createHeroSchema>

export interface ActionResult {
  success: boolean
  message: string
  errors?: Record<string, string>
}

export async function createHeroSlide(formData: FormData): Promise<ActionResult> {
  try {
    // Convert FormData to object
    const rawData: Record<string, unknown> = {}
    
    // Handle fields from FormData
    for (const [key, value] of formData.entries()) {
      if (key === 'targetPages' || key === 'targetAudience') {
        if (!rawData[key]) {
          rawData[key] = []
        }
        if (value && value !== '') {
          (rawData[key] as string[]).push(value.toString())
        }
      } else if (key === 'isActive' || key === 'isFeatured') {
        rawData[key] = value === 'on' ? true : false
      } else if (key === 'sortOrder') {
        const numValue = parseInt(value.toString())
        rawData[key] = isNaN(numValue) ? undefined : numValue
      } else if (key === 'overlayOpacity') {
        const numValue = parseFloat(value.toString());
        rawData[key] = isNaN(numValue) ? undefined : numValue;
      } else {
        rawData[key] = value.toString().trim() || undefined
      }
    }
    
    // Set boolean defaults for checkboxes if they were unchecked and not included in FormData
    if (formData.get('isActive') === null) rawData.isActive = false;
    if (formData.get('isFeatured') === null) rawData.isFeatured = false;


    // Validate the data with Zod
    const validatedData = createHeroSchema.parse(rawData)

    // Create the hero slide in the database
    const hero = await prisma.hero.create({
      data: {
        ...validatedData,
        showFrom: validatedData.showFrom ? new Date(validatedData.showFrom) : null,
        showUntil: validatedData.showUntil ? new Date(validatedData.showUntil) : null,
        overlayOpacity: validatedData.overlayOpacity ? new Decimal(validatedData.overlayOpacity) : null,
      }
    })
    

    // Revalidate the hero slides page to show the new data
    revalidatePath('/admin/cms/hero-slides')
    
    return {
      success: true,
      message: `Hero slide "${hero.title}" created successfully!`
    }

  } catch (error) {
    console.error('Failed to create hero slide:', error)

    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {}
      error.issues.forEach((issue) => {
        const path = issue.path.join('.')
        fieldErrors[path] = issue.message
      })
      
      return {
        success: false,
        message: 'Validation failed',
        errors: fieldErrors
      }
    }

    return {
      success: false,
      message: 'Failed to create hero slide. Please try again.'
    }
  }
}

export async function createHeroSlideAndRedirect(formData: FormData): Promise<void> {
  const result = await createHeroSlide(formData)
  
  if (result.success) {
    redirect('/admin/cms/hero-slides')
  } else {
    throw new Error(result.message)
  }
}