
// lib/types/business-unit.ts
export interface BusinessUnitImage {
  id: string;
  imageId: string;
  context: string | null;
  sortOrder: number;
  isPrimary: boolean;
  image: {
    id: string;
    originalUrl: string;
    title: string | null;
    altText: string | null;
    description: string | null;
  };
}

export interface BusinessUnitData {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  shortDescription: string | null;
  propertyType: string;
  city: string;
  state: string | null;
  country: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  slug: string;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  images: BusinessUnitImage[];
  amenities: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    category: string | null;
  }[];
  _count: {
    rooms: number;
    specialOffers: number;
    restaurants: number;
    events: number;
  };
}