// lib/reservations.ts
'use server';

import { prisma } from '@/lib/prisma';


export async function getReservationByConfirmationNumber(confirmationNumber: string) {
  const reservation = await prisma.reservation.findUnique({
    where: {
      confirmationNumber: confirmationNumber,
    },
    include: {
      guest: true,
      businessUnit: {
        select: {
          displayName: true,
          slug: true,
          city: true,
          country: true,
          primaryCurrency: true,
        },
      },
      rooms: {
        include: {
          roomType: true,
        },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  return reservation;
}