'use server';

import { prisma } from '../prisma';
import { cache } from 'react';
import { ReservationStatus, ReservationSource, PaymentStatus, PaymentMethod, Prisma } from '@prisma/client';

export interface ReservationData {
  id: string;
  confirmationNumber: string;
  status: ReservationStatus;
  checkInDate: Date;
  checkOutDate: Date;
  nights: number;
  adults: number;
  children: number;
  totalAmount: string;
  currency: string;
  specialRequests: string | null;
  internalNotes: string | null;
  source: ReservationSource;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    country: string | null;
  };
  businessUnit: {
    id: string;
    name: string;
    displayName: string;
    city: string;
    country: string;
  };
  rooms: Array<{
    id: string;
    room?: {
      id: string;
      roomNumber: string;
      roomType: {
        id: string;
        name: string;
        description: string | null;
      };
    };
    baseRate: string;
    totalAmount: string;
  }>;
  payments: Array<{
    id: string;
    amount: string;
    currency: string;
    status: PaymentStatus;
    method: PaymentMethod;
    createdAt: Date;
  }>;
}

const reservationPayload = Prisma.validator<Prisma.ReservationDefaultArgs>()({
  include: {
    guest: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        country: true,
      },
    },
    businessUnit: {
      select: {
        id: true,
        name: true,
        displayName: true,
        city: true,
        country: true,
      },
    },
    rooms: {
      include: {
        room: {
          select: {
            id: true,
            roomNumber: true,
            roomType: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    },
    payments: {
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        method: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    },
  },
});

type ReservationPayload = Prisma.ReservationGetPayload<typeof reservationPayload>;

const mapReservationToPlainObject = (reservation: ReservationPayload): ReservationData => {
  return {
    id: reservation.id,
    confirmationNumber: reservation.confirmationNumber,
    status: reservation.status,
    checkInDate: reservation.checkInDate,
    checkOutDate: reservation.checkOutDate,
    nights: reservation.nights,
    adults: reservation.adults,
    children: reservation.children,
    totalAmount: reservation.totalAmount.toString(),
    currency: reservation.currency,
    specialRequests: reservation.specialRequests,
    internalNotes: reservation.internalNotes,
    source: reservation.source,
    paymentStatus: reservation.paymentStatus,
    createdAt: reservation.createdAt,
    updatedAt: reservation.updatedAt,
    guest: reservation.guest,
    businessUnit: reservation.businessUnit,
    rooms: reservation.rooms.map((room) => ({
      id: room.id,
      room: room.room ? {
        id: room.room.id,
        roomNumber: room.room.roomNumber,
        roomType: room.room.roomType,
      } : undefined,
      baseRate: room.baseRate.toString(),
      totalAmount: room.totalAmount.toString(),
    })),
    payments: reservation.payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount.toString(),
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      createdAt: payment.createdAt,
    })),
  };
};

export const getAllReservations = cache(async (
  businessUnitId?: string,
  status?: ReservationStatus,
  limit?: number
): Promise<ReservationData[]> => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        ...(businessUnitId && { businessUnitId }),
        ...(status && { status }),
      },
      ...reservationPayload,
      orderBy: [
        { createdAt: 'desc' },
      ],
      ...(limit && { take: limit }),
    });

    return reservations.map(mapReservationToPlainObject);
  } catch (error) {
    console.error('Error fetching all reservations:', error);
    return [];
  }
});

export const getReservationById = cache(async (id: string): Promise<ReservationData | null> => {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      ...reservationPayload,
    });

    if (!reservation) return null;
    return mapReservationToPlainObject(reservation);
  } catch (error) {
    console.error('Error fetching reservation by ID:', error);
    return null;
  }
});

export const getRecentReservations = cache(async (limit: number = 10): Promise<ReservationData[]> => {
  try {
    const reservations = await prisma.reservation.findMany({
      ...reservationPayload,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return reservations.map(mapReservationToPlainObject);
  } catch (error) {
    console.error('Error fetching recent reservations:', error);
    return [];
  }
});