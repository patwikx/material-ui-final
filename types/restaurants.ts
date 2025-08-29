// types/restaurant.ts

import { Decimal } from "@prisma/client/runtime/library";

export interface RestaurantImage {
  id: string;
  imageId: string;
  context: string | null;
  sortOrder: number;
  isPrimary: boolean;
  image: {
    id: string;
    originalUrl: string;
    thumbnailUrl: string | null;
    mediumUrl: string | null;
    largeUrl: string | null;
    title: string | null;
    description: string | null;
    altText: string | null;
  };
}

export interface RestaurantWithDetails {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  type: string;
  cuisine: string[];
  location: string | null;
  phone: string | null;
  email: string | null;
  operatingHours: unknown | null;
  features: string[];
  priceRange: string | null;
  averageMeal: Decimal | null; // Changed from number | null
  currency: string;
  isActive: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  businessUnit: {
    id: string;
    name: string;
    displayName: string;
  };
  images: RestaurantImage[];
}