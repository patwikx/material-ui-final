// lib/actions/reservation-counts.ts
'use server';

import { prisma } from '../prisma';
import { cache } from 'react';
import { ReservationStatus } from '@prisma/client';

export const getTodayCheckInsCount = cache(async (): Promise<number> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const count = await prisma.reservation.count({
      where: {
        checkInDate: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN],
        },
      },
    });
    return count;
  } catch (error) {
    console.error('Error fetching today\'s check-in count:', error);
    return 0;
  }
});

export const getTodayCheckOutsCount = cache(async (): Promise<number> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const count = await prisma.reservation.count({
      where: {
        checkOutDate: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          not: {
            in: [ReservationStatus.CANCELLED, ReservationStatus.NO_SHOW],
          },
        },
      },
    });
    return count;
  } catch (error) {
    console.error('Error fetching today\'s check-out count:', error);
    return 0;
  }
});

export const getTotalPendingReservationsCount = cache(async (): Promise<number> => {
  try {
    const count = await prisma.reservation.count({
      where: {
        status: ReservationStatus.PENDING,
      },
    });
    return count;
  } catch (error) {
    console.error('Error fetching total pending reservations count:', error);
    return 0;
  }
});