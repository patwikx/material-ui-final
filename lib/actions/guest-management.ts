'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { InputJsonValue } from '@prisma/client/runtime/library';

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export interface GuestData {
  id: string;
  businessUnitId: string;
  title: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: Date | null;
  nationality: string | null;
  passportNumber: string | null;
  passportExpiry: Date | null;
  idNumber: string | null;
  idType: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  vipStatus: boolean;
  loyaltyNumber: string | null;
  preferences: Record<string, unknown> | null;
  notes: string | null;
  firstStayDate: Date | null;
  lastStayDate: Date | null;
  blacklistedAt: Date | null;
  totalSpent: string | null;
  marketingOptIn: boolean;
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    reservations: number;
    stays: number;
  };
}

export interface CreateGuestData {
  businessUnitId: string;
  title: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: Date | null;
  nationality: string | null;
  country: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  passportNumber: string | null;
  passportExpiry: Date | null;
  idNumber: string | null;
  idType: string | null;
  preferences: Record<string, unknown> | null;
  notes: string | null;
  vipStatus: boolean;
  loyaltyNumber: string | null;
  marketingOptIn: boolean;
  source: string | null;
}

export interface UpdateGuestData extends CreateGuestData {
  id: string;
}

export async function getAllGuests(businessUnitId?: string): Promise<GuestData[]> {
  try {
    const guests = await prisma.guest.findMany({
      where: {
        ...(businessUnitId && { businessUnitId }),
      },
      include: {
        _count: {
          select: {
            reservations: true,
            stays: true,
          },
        },
      },
      orderBy: [
        { vipStatus: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return guests.map(guest => ({
      ...guest,
      totalSpent: guest.totalSpent?.toString() ?? null,
      preferences: guest.preferences as Record<string, unknown> | null,
    }));
  } catch (error) {
    console.error('Error fetching all guests:', error);
    return [];
  }
}

export async function getGuestById(id: string): Promise<GuestData | null> {
  try {
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            reservations: true,
            stays: true,
          },
        },
      },
    });

    if (!guest) return null;

    return {
      ...guest,
      totalSpent: guest.totalSpent?.toString() ?? null,
      preferences: guest.preferences as Record<string, unknown> | null,
    };
  } catch (error) {
    console.error('Error fetching guest by ID:', error);
    return null;
  }
}

export async function createGuest(data: CreateGuestData): Promise<ActionResult> {
  try {
    await prisma.guest.create({
      data: {
        ...data,
        preferences: data.preferences as InputJsonValue,
      },
    });

    revalidatePath('/admin/operations/guests');

    return {
      success: true,
      message: 'Guest created successfully',
    };
  } catch (error) {
    console.error('Error creating guest:', error);
    return {
      success: false,
      message: 'Failed to create guest',
    };
  }
}

export async function updateGuest(data: UpdateGuestData): Promise<ActionResult> {
  try {
    const { id, ...updateData } = data;
    await prisma.guest.update({
      where: { id },
      data: {
        ...updateData,
        preferences: updateData.preferences as InputJsonValue,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/operations/guests');

    return {
      success: true,
      message: 'Guest updated successfully',
    };
  } catch (error) {
    console.error('Error updating guest:', error);
    return {
      success: false,
      message: 'Failed to update guest',
    };
  }
}

export async function deleteGuest(id: string): Promise<ActionResult> {
  try {
    await prisma.guest.delete({
      where: { id },
    });

    revalidatePath('/admin/operations/guests');

    return {
      success: true,
      message: 'Guest deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting guest:', error);
    return {
      success: false,
      message: 'Failed to delete guest',
    };
  }
}

export async function toggleGuestVipStatus(id: string, vipStatus: boolean): Promise<ActionResult> {
  try {
    await prisma.guest.update({
      where: { id },
      data: {
        vipStatus,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/operations/guests');

    return {
      success: true,
      message: `Guest ${vipStatus ? 'marked as VIP' : 'VIP status removed'} successfully`,
    };
  } catch (error) {
    console.error('Error toggling guest VIP status:', error);
    return {
      success: false,
      message: 'Failed to update guest VIP status',
    };
  }
}