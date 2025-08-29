export interface BusinessUnit {
  id: string;
  name: string;
  description: string;
  image: string;
  amenities: string[];
  location: string;
  images: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  cuisine: string[];
  location: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  image: string;
  location: string;
  category?: string; // Add this optional field
}

export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  image: string;
  terms: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  avatar: string;
  property: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}