import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma, ReservationStatus, PaymentStatus, ReservationSource } from '@prisma/client'

// Updated Zod schema to match your Prisma model fields
const createReservationSchema = z.object({
  businessUnitId: z.string().uuid(),
  guestId: z.string().uuid(),
  
  // Room configuration for ReservationRoom creation
  roomTypeId: z.string().uuid("A room type must be selected"),
  roomId: z.string().uuid().optional(), // Optional for initial booking, can be assigned later
  
  source: z.nativeEnum(ReservationSource).default('DIRECT'),
  status: z.nativeEnum(ReservationStatus).default('CONFIRMED'),
  
  // Date fields - keeping as strings for flexibility
  checkInDate: z.string().min(1, "Check-in date is required"),
  checkOutDate: z.string().min(1, "Check-out date is required"),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  nights: z.number().int().min(1),
  
  // Guest count
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  infants: z.number().int().min(0).default(0),
  
  // Main reservation pricing
  subtotal: z.number(),
  taxes: z.number().default(0),
  serviceFee: z.number().default(0),
  discounts: z.number().default(0),
  totalAmount: z.number(),
  currency: z.string().default("PHP"),
  
  // Payment information
  paymentStatus: z.nativeEnum(PaymentStatus).default('PENDING'),
  paymentDue: z.string().optional(), // DateTime as string
  depositRequired: z.number().optional(),
  depositPaid: z.number().default(0),
  
  // Room-specific pricing (for ReservationRoom)
  baseRate: z.number(),
  discountedRate: z.number().optional(),
  extraPersonRate: z.number().default(0),
  childRate: z.number().default(0),
  roomSubtotal: z.number(),
  extrasSubtotal: z.number().default(0),
  addonsSubtotal: z.number().default(0),
  discountAmount: z.number().default(0),
  
  // Notes and requests
  specialRequests: z.string().optional(),
  guestNotes: z.string().optional(),
  internalNotes: z.string().optional(),
  
  // Booking metadata
  bookedBy: z.string().optional(),
  confirmationNumber: z.string().min(1),
  
  // Room preferences and requests (for ReservationRoom)
  roomPreferences: z.record(z.string(), z.any()).optional(), // JSON field
  roomSpecialRequests: z.string().optional(),
  
  // Optional room addons
  addons: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    unitPrice: z.number(),
    quantity: z.number().int().min(1).default(1),
    totalAmount: z.number(),
    isOptional: z.boolean().default(true),
    isChargeable: z.boolean().default(true)
  })).optional()
}).refine(
  (data) => new Date(data.checkOutDate) > new Date(data.checkInDate),
  {
    message: "Check-out date must be after check-in date",
    path: ["checkOutDate"]
  }
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessUnitId = searchParams.get('businessUnitId')
    const guestId = searchParams.get('guestId')
    const status = searchParams.get('status')
    const confirmationNumber = searchParams.get('confirmationNumber')
    
    const where: Prisma.ReservationWhereInput = {}
    
    if (businessUnitId) where.businessUnitId = businessUnitId
    if (guestId) where.guestId = guestId
    if (status) where.status = status as ReservationStatus
    if (confirmationNumber) where.confirmationNumber = confirmationNumber
    
    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        guest: true,
        businessUnit: true,
        rooms: {
          include: {
            room: {
              include: {
                roomType: true
              }
            },
            roomType: true,
            roomAddons: true
          }
        },
        payments: true,
        stay: true,
        interactions: true,
        offerBookings: true,
        promoUsages: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(reservations)
  } catch (error) {
    console.error('Failed to fetch reservations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createReservationSchema.parse(body)
    
    const { 
      roomId, 
      roomTypeId, 
      guestId, 
      businessUnitId, 
      baseRate,
      discountedRate,
      extraPersonRate,
      childRate,
      roomSubtotal,
      extrasSubtotal,
      addonsSubtotal,
      discountAmount,
      roomPreferences,
      roomSpecialRequests,
      addons,
      paymentDue,
      ...reservationData 
    } = validatedData;

    // Verify room type exists
    const roomType = await prisma.roomType_Model.findUnique({
      where: { id: roomTypeId }
    });

    if (!roomType) {
      return NextResponse.json(
        { error: "Selected room type not found." }, 
        { status: 404 }
      );
    }

    // If roomId is provided, verify it exists and belongs to the correct room type
    if (roomId) {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { roomType: true }
      });

      if (!room) {
        return NextResponse.json(
          { error: "Selected room not found." }, 
          { status: 404 }
        );
      }

      if (room.roomTypeId !== roomTypeId) {
        return NextResponse.json(
          { error: "Selected room does not match the specified room type." }, 
          { status: 400 }
        );
      }
    }

    // Calculate room total amount
    const roomTotalAmount = roomSubtotal + extrasSubtotal + addonsSubtotal - discountAmount;

    // Prepare ReservationRoom data
    const reservationRoomData: Prisma.ReservationRoomCreateWithoutReservationInput = {
      ...(roomId && { room: { connect: { id: roomId } } }), // Connect room if provided
      roomType: { connect: { id: roomTypeId } },
      baseRate: new Prisma.Decimal(baseRate),
      discountedRate: discountedRate ? new Prisma.Decimal(discountedRate) : undefined,
      extraPersonRate: new Prisma.Decimal(extraPersonRate),
      childRate: new Prisma.Decimal(childRate),
      nights: reservationData.nights,
      adults: reservationData.adults,
      children: reservationData.children,
      infants: reservationData.infants,
      roomSubtotal: new Prisma.Decimal(roomSubtotal),
      extrasSubtotal: new Prisma.Decimal(extrasSubtotal),
      addonsSubtotal: new Prisma.Decimal(addonsSubtotal),
      discountAmount: new Prisma.Decimal(discountAmount),
      totalAmount: new Prisma.Decimal(roomTotalAmount),
      preferences: roomPreferences ? (roomPreferences as Prisma.InputJsonValue) : undefined,
      specialRequests: roomSpecialRequests || undefined,
      // Add room addons if provided
      ...(addons && addons.length > 0 && {
        roomAddons: {
          create: addons.map(addon => ({
            name: addon.name,
            description: addon.description || undefined,
            category: addon.category || undefined,
            unitPrice: new Prisma.Decimal(addon.unitPrice),
            quantity: addon.quantity,
            totalAmount: new Prisma.Decimal(addon.totalAmount),
            isOptional: addon.isOptional,
            isChargeable: addon.isChargeable
          }))
        }
      })
    };

    // Prepare main reservation data
    const dataToCreate: Prisma.ReservationCreateInput = {
      confirmationNumber: reservationData.confirmationNumber,
      source: reservationData.source,
      status: reservationData.status,
      checkInDate: new Date(validatedData.checkInDate),
      checkOutDate: new Date(validatedData.checkOutDate),
      checkInTime: reservationData.checkInTime || null,
      checkOutTime: reservationData.checkOutTime || null,
      nights: reservationData.nights,
      adults: reservationData.adults,
      children: reservationData.children,
      infants: reservationData.infants,
      subtotal: new Prisma.Decimal(reservationData.subtotal),
      taxes: new Prisma.Decimal(reservationData.taxes),
      serviceFee: new Prisma.Decimal(reservationData.serviceFee),
      discounts: new Prisma.Decimal(reservationData.discounts),
      totalAmount: new Prisma.Decimal(reservationData.totalAmount),
      currency: reservationData.currency,
      paymentStatus: reservationData.paymentStatus,
      paymentDue: paymentDue ? new Date(paymentDue) : null,
      depositRequired: validatedData.depositRequired ? new Prisma.Decimal(validatedData.depositRequired) : null,
      depositPaid: new Prisma.Decimal(reservationData.depositPaid),
      specialRequests: reservationData.specialRequests || null,
      guestNotes: reservationData.guestNotes || null,
      internalNotes: reservationData.internalNotes || null,
      bookedBy: reservationData.bookedBy || null,
      // Connect related entities
      guest: { connect: { id: guestId } },
      businessUnit: { connect: { id: businessUnitId } },
      // Create the reservation room
      rooms: {
        create: [reservationRoomData]
      }
    };
    
    const newReservation = await prisma.reservation.create({
      data: dataToCreate,
      include: {
        guest: true,
        businessUnit: true,
        rooms: {
          include: {
            room: {
              include: {
                roomType: true
              }
            },
            roomType: true,
            roomAddons: true
          }
        },
        payments: true,
        stay: true
      }
    });
    
    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error('Failed to create reservation:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A reservation with this confirmation number already exists.' },
          { status: 409 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating the reservation.' },
      { status: 500 }
    );
  }
}