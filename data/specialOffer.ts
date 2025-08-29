import { SpecialOffer } from '../types';

export const specialOffers: SpecialOffer[] = [
  {
    id: '1',
    title: 'Early Bird Paradise',
    description: 'Book 60 days in advance and save big on your tropical getaway at Dolores Tropicana Resort.',
    discount: 'Up to 35% OFF',
    validUntil: '2024-12-31',
    image: 'https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg?auto=compress&cs=tinysrgb&w=600',
    terms: ['Valid for bookings made 60 days in advance', 'Minimum 3-night stay required', 'Subject to availability', 'Cannot be combined with other offers'],
  },
  {
    id: '2',
    title: 'Family Fun Package',
    description: 'Create unforgettable memories with our all-inclusive family package at Dolores Farm Resort.',
    discount: '25% OFF',
    validUntil: '2024-11-30',
    image: 'https://images.pexels.com/photos/1838554/pexels-photo-1838554.jpeg?auto=compress&cs=tinysrgb&w=600',
    terms: ['Valid for families with children under 12', 'Includes all meals and activities', 'Minimum 2-night stay', 'Advance booking required'],
  },
  {
    id: '3',
    title: 'Business Executive Deal',
    description: 'Special rates for business travelers at Anchor Hotel with complimentary meeting room access.',
    discount: '20% OFF',
    validUntil: '2024-12-15',
    image: 'https://images.pexels.com/photos/2096983/pexels-photo-2096983.jpeg?auto=compress&cs=tinysrgb&w=600',
    terms: ['Valid for corporate bookings', 'Includes breakfast and WiFi', 'Meeting room subject to availability', 'Flexible cancellation policy'],
  },
];