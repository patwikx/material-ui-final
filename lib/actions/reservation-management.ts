'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { ReservationStatus } from '@prisma/client';

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export interface UpdateReservationStatusData {
  id: string;
  status: ReservationStatus;
  notes?: string;
}

export async function updateReservationStatus(data: UpdateReservationStatusData): Promise<ActionResult> {
  try {
    await prisma.reservation.update({
      where: { id: data.id },
      data: {
        status: data.status,
        internalNotes: data.notes,
        updatedAt: new Date(),
      }
    });

    revalidatePath('/admin/operations/reservations');

    return {
      success: true,
      message: 'Reservation status updated successfully'
    };
  } catch (error) {
    console.error('Error updating reservation status:', error);
    return {
      success: false,
      message: 'Failed to update reservation status'
    };
  }
}

export async function confirmReservation(id: string): Promise<ActionResult> {
  try {
    await prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CONFIRMED,
        updatedAt: new Date()
      }
    });

    revalidatePath('/admin/operations/reservations');

    return {
      success: true,
      message: 'Reservation confirmed successfully'
    };
  } catch (error) {
    console.error('Error confirming reservation:', error);
    return {
      success: false,
      message: 'Failed to confirm reservation'
    };
  }
}

export async function cancelReservation(id: string, reason?: string): Promise<ActionResult> {
  try {
    await prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CANCELLED,
        cancellationReason: reason,
        updatedAt: new Date(),
      }
    });

    revalidatePath('/admin/operations/reservations');

    return {
      success: true,
      message: 'Reservation cancelled successfully'
    };
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return {
      success: false,
      message: 'Failed to cancel reservation'
    };
  }
}