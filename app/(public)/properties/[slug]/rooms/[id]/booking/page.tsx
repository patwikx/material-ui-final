import React from 'react';
import { notFound } from 'next/navigation';
import { getRoomTypeByIdAndProperty } from '@/lib/room-details';
import { RoomBookingClient } from './components/room-booking-page';


interface BookingPageProps {
  params: { slug: string; id: string };
}

const BookingPage: React.FC<BookingPageProps> = async ({ params }) => {
  const { slug, id } = await params;
  
  const roomType = await getRoomTypeByIdAndProperty(id, slug);

  if (!roomType) {
    notFound();
  }

  // Transform the data for the client component
  const property = {
    id: roomType.businessUnit.id,
    displayName: roomType.businessUnit.displayName,
    slug: roomType.businessUnit.slug,
    checkInTime: roomType.businessUnit.checkInTime || '3:00 PM',
    checkOutTime: roomType.businessUnit.checkOutTime || '12:00 PM',
    cancellationHours: roomType.businessUnit.cancellationHours || 24,
    primaryCurrency: roomType.businessUnit.primaryCurrency || 'PHP',
    location: `${roomType.businessUnit.city}, ${roomType.businessUnit.country}`,
    description: roomType.businessUnit.description,
  };

  const room = {
    id: roomType.id,
    displayName: roomType.displayName,
    maxOccupancy: roomType.maxOccupancy,
    maxAdults: roomType.maxAdults,
    maxChildren: roomType.maxChildren,
    baseRate: Number(roomType.rates.find(rate => rate.isDefault)?.baseRate || roomType.rates[0]?.baseRate || 0),
    description: roomType.description,
    amenities: roomType.amenities.map(rel => rel.amenity.name),
    size: roomType.roomSize ? `${roomType.roomSize} sqm` : undefined,
    images: roomType.images.map(rel => rel.image.originalUrl),
    features: {
      hasBalcony: roomType.hasBalcony,
      hasOceanView: roomType.hasOceanView,
      hasPoolView: roomType.hasPoolView,
      hasKitchenette: roomType.hasKitchenette,
      hasLivingArea: roomType.hasLivingArea,
      petFriendly: roomType.petFriendly,
      isAccessible: roomType.isAccessible,
      smokingAllowed: roomType.smokingAllowed,
    },
    bedConfiguration: roomType.bedConfiguration,
  };

  return <RoomBookingClient property={property} roomType={room} />;
};

export default BookingPage;