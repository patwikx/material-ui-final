// /app/api/pricing/calculate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const pricingSchema = z.object({
  businessUnitId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const validatedData = pricingSchema.parse({
      businessUnitId: searchParams.get('businessUnitId'),
      roomTypeId: searchParams.get('roomTypeId'),
      checkInDate: searchParams.get('checkInDate'),
      checkOutDate: searchParams.get('checkOutDate'),
    });

    const businessUnit = await prisma.businessUnit.findUnique({
      where: { id: validatedData.businessUnitId },
      select: {
        taxRate: true,
        serviceFeeRate: true,
      },
    });

    if (!businessUnit) {
      return NextResponse.json({ error: 'Business unit not found' }, { status: 404 });
    }
    
    const roomType = await prisma.roomType_Model.findUnique({
      where: { id: validatedData.roomTypeId },
      select: {
        baseRate: true,
      },
    });

    if (!roomType) {
      return NextResponse.json({ error: 'Room type not found' }, { status: 404 });
    }

    const checkIn = new Date(validatedData.checkInDate);
    const checkOut = new Date(validatedData.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return NextResponse.json({ error: 'Check-out date must be after check-in date' }, { status: 400 });
    }

    const baseRateDecimal = new Prisma.Decimal(roomType.baseRate);
    const subtotal = baseRateDecimal.times(nights);
    
    const taxes = businessUnit.taxRate ? subtotal.times(businessUnit.taxRate / 100) : new Prisma.Decimal(0);
    const serviceFee = businessUnit.serviceFeeRate ? subtotal.times(businessUnit.serviceFeeRate / 100) : new Prisma.Decimal(0);
    const totalAmount = subtotal.plus(taxes).plus(serviceFee);

    return NextResponse.json({
      subtotal: subtotal.toNumber(),
      taxes: taxes.toNumber(),
      serviceFee: serviceFee.toNumber(),
      totalAmount: totalAmount.toNumber(),
      nights: nights,
    });

  } catch (error) {
    console.error('Error calculating price:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}