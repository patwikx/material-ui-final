import { BusinessUnit } from '../types';

export const businessUnits: BusinessUnit[] = [
  {
    id: 'anchor-hotel',
    name: 'Anchor Hotel',
    description: 'A sophisticated urban retreat in the heart of the city, offering modern luxury with panoramic city views and world-class amenities.',
    image: 'https://images.pexels.com/photos/1838554/pexels-photo-1838554.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1838554/pexels-photo-1838554.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['Rooftop Pool', 'Spa & Wellness Center', 'Business Center', 'Fitness Center', 'Concierge Service', '24/7 Room Service'],
    location: 'Downtown Metro City',
    coordinates: { lat: 14.5995, lng: 120.9842 },
  },
  {
    id: 'dolores-farm-resort',
    name: 'Dolores Farm Resort',
    description: 'An eco-friendly countryside escape surrounded by lush farmlands, perfect for those seeking tranquility and authentic rural experiences.',
    image: 'https://images.pexels.com/photos/1838554/pexels-photo-1838554.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1172064/pexels-photo-1172064.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1655166/pexels-photo-1655166.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1134188/pexels-photo-1134188.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['Organic Farm Tours', 'Horse Riding', 'Nature Trails', 'Farm-to-Table Dining', 'Yoga Pavilion', 'Children\'s Activity Center'],
    location: 'Dolores Valley Countryside',
    coordinates: { lat: 14.2350, lng: 121.1531 },
  },
  {
    id: 'dolores-lake-resort',
    name: 'Dolores Lake Resort',
    description: 'A serene lakeside sanctuary offering breathtaking water views, perfect for romantic getaways and peaceful retreats.',
    image: 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1134188/pexels-photo-1134188.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['Private Lake Access', 'Water Sports Center', 'Lakeside Spa', 'Sunset Dining', 'Kayak & Paddleboard Rentals', 'Fishing Expeditions'],
    location: 'Dolores Lake District',
    coordinates: { lat: 14.1234, lng: 121.2345 },
  },
  {
    id: 'dolores-tropicana-resort',
    name: 'Dolores Tropicana Resort',
    description: 'Our flagship tropical paradise resort featuring pristine beaches, crystal-clear waters, and unparalleled luxury amenities.',
    image: 'https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg?auto=compress&cs=tinysrgb&w=800',
    images: [
      'https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1450363/pexels-photo-1450363.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1450394/pexels-photo-1450394.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/221457/pexels-photo-221457.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    amenities: ['Private Beach', 'Infinity Pools', 'World-Class Spa', 'Water Villa Suites', 'Diving Center', 'Tropical Gardens'],
    location: 'Dolores Tropical Island',
    coordinates: { lat: 13.9876, lng: 121.3456 },
  },
];