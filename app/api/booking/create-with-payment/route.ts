// /api/booking/create-with-payment/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { CreateCheckoutSessionRequest, PayMongoResponse, CheckoutSessionAttributes } from '@/types/paymongo-types';
import { paymongo } from '@/lib/paymongo';
import { Prisma } from '@prisma/client';

const bookingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime(),
  adults: z.number().int().positive(),
  children: z.number().int().nonnegative(),
  nights: z.number().int().positive(),
  subtotal: z.number().positive(),
  businessUnitId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
  specialRequests: z.string().optional(),
  guestNotes: z.string().optional(),
});

type BookingRequest = z.infer<typeof bookingSchema>;

interface CreateReservationResponse {
  reservationId: string;
  confirmationNumber: string;
  checkoutUrl: string;
  paymentSessionId: string;
}

interface CreateReservationError {
  error: string;
  details?: string;
}

const generateConfirmationNumber = (): string => {
  const prefix = "RES";
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${timestamp}-${randomPart}`;
};

export async function POST(req: NextRequest): Promise<NextResponse<CreateReservationResponse | CreateReservationError>> {
  try {
    const body: unknown = await req.json();
    const validatedData: BookingRequest = bookingSchema.parse(body);

    const businessUnit = await prisma.businessUnit.findUnique({
      where: { id: validatedData.businessUnitId },
      select: {
        id: true,
        isActive: true,
        name: true,
        primaryCurrency: true,
        taxRate: true,
        serviceFeeRate: true,
      }
    });

    if (!businessUnit || !businessUnit.isActive) {
      return NextResponse.json({
        error: 'Invalid or inactive property',
        details: 'The selected property is not available for booking'
      }, { status: 400 });
    }

    const roomType = await prisma.roomType_Model.findUnique({
      where: { id: validatedData.roomTypeId },
      select: {
        id: true,
        businessUnitId: true,
        name: true,
        maxOccupancy: true,
        maxAdults: true,
        maxChildren: true,
        isActive: true,
        baseRate: true
      }
    });

    if (!roomType || !roomType.isActive || roomType.businessUnitId !== validatedData.businessUnitId) {
      return NextResponse.json({
        error: 'Invalid room type',
        details: 'The selected room type is not available'
      }, { status: 400 });
    }
    
    const totalGuests = validatedData.adults + validatedData.children;
    if (totalGuests > roomType.maxOccupancy) {
      return NextResponse.json({
        error: 'Occupancy exceeded',
        details: `Maximum ${roomType.maxOccupancy} guests allowed for this room type`
      }, { status: 400 });
    }
    if (validatedData.adults > roomType.maxAdults) {
      return NextResponse.json({
        error: 'Too many adults',
        details: `Maximum ${roomType.maxAdults} adults allowed for this room type`
      }, { status: 400 });
    }
    if (validatedData.children > roomType.maxChildren) {
      return NextResponse.json({
        error: 'Too many children',
        details: `Maximum ${roomType.maxChildren} children allowed for this room type`
      }, { status: 400 });
    }

    const baseRateDecimal = new Prisma.Decimal(roomType.baseRate);
    const calculatedSubtotal = baseRateDecimal.times(validatedData.nights);

    if (!calculatedSubtotal.equals(new Prisma.Decimal(validatedData.subtotal))) {
      console.error('Price mismatch detected!', {
        clientSubtotal: validatedData.subtotal,
        serverSubtotal: calculatedSubtotal.toNumber(),
      });
      return NextResponse.json({
        error: 'Price validation failed',
        details: 'The price provided is invalid. Please refresh the page and try again.'
      }, { status: 400 });
    }

    const taxes = businessUnit.taxRate ? calculatedSubtotal.times(businessUnit.taxRate / 100) : new Prisma.Decimal(0);
    const serviceFee = businessUnit.serviceFeeRate ? calculatedSubtotal.times(businessUnit.serviceFeeRate / 100) : new Prisma.Decimal(0);
    const totalAmount = calculatedSubtotal.plus(taxes).plus(serviceFee);

    const result = await prisma.$transaction(async (tx) => {
      let guest = await tx.guest.findUnique({
        where: {
          businessUnitId_email: {
            businessUnitId: validatedData.businessUnitId,
            email: validatedData.email,
          }
        },
      });

      if (!guest) {
        guest = await tx.guest.create({
          data: {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            email: validatedData.email,
            phone: validatedData.phone,
            businessUnitId: validatedData.businessUnitId,
            source: 'WEBSITE',
          },
        });
      } else {
        guest = await tx.guest.update({
          where: { id: guest.id },
          data: {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            phone: validatedData.phone || guest.phone,
          }
        });
      }

      const confirmationNumber = generateConfirmationNumber();

      const newReservation = await tx.reservation.create({
        data: {
          guestId: guest.id,
          businessUnitId: validatedData.businessUnitId,
          confirmationNumber,
          checkInDate: validatedData.checkInDate,
          checkOutDate: validatedData.checkOutDate,
          adults: validatedData.adults,
          children: validatedData.children,
          nights: validatedData.nights,
          subtotal: calculatedSubtotal,
          taxes: taxes,
          serviceFee: serviceFee,
          totalAmount: totalAmount,
          currency: businessUnit.primaryCurrency || 'PHP',
          paymentStatus: 'PENDING',
          status: 'PENDING',
          source: 'WEBSITE',
          specialRequests: validatedData.specialRequests,
          guestNotes: validatedData.guestNotes,
          rooms: {
            create: [{
              roomTypeId: validatedData.roomTypeId,
              baseRate: baseRateDecimal,
              nights: validatedData.nights,
              adults: validatedData.adults,
              children: validatedData.children,
              roomSubtotal: calculatedSubtotal,
              totalAmount: totalAmount,
            }]
          }
        },
        include: {
          guest: true,
          businessUnit: {
            select: { name: true, city: true, country: true }
          }
        }
      });

      return { reservation: newReservation, guest };
    });

    const { reservation } = result;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const amountInCentavos = Math.round(totalAmount.toNumber() * 100);

    const checkoutSessionRequest: CreateCheckoutSessionRequest = {
      send_email_receipt: true,
      show_description: true,
      show_line_items: true,
      line_items: [
        {
          currency: reservation.currency as 'PHP',
          amount: amountInCentavos,
          description: `${reservation.businessUnit.name} - ${reservation.nights} night${reservation.nights > 1 ? 's' : ''}`,
          name: `Booking Ref. (${reservation.confirmationNumber})`,
          quantity: 1,
        }
      ],
      payment_method_types: [
        'card',
        'paymaya',
        'gcash',
        'grab_pay',
        'billease',
        'dob',
        'dob_ubp',
        'brankas_bdo',
        'brankas_landbank',
        'brankas_metrobank'
      ],
      customer_email: validatedData.email,
      billing: {
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        email: validatedData.email,
        phone: validatedData.phone,
      },
      description: `Reservation ${reservation.confirmationNumber} - ${reservation.businessUnit.name}`,
      reference_number: reservation.confirmationNumber,
      metadata: {
        reservation_id: reservation.id,
        confirmation_number: reservation.confirmationNumber,
        business_unit_id: validatedData.businessUnitId,
        guest_id: reservation.guestId,
        guest_name: `${validatedData.firstName} ${validatedData.lastName}`,
        check_in: validatedData.checkInDate,
        check_out: validatedData.checkOutDate,
        adults: validatedData.adults.toString(),
        children: validatedData.children.toString(),
        nights: reservation.nights.toString(),
        room_type_id: validatedData.roomTypeId,
      }
    };

    const checkoutSession: PayMongoResponse<CheckoutSessionAttributes> = await paymongo.createCheckoutSession(checkoutSessionRequest);
    
    // Create the payment record with proper type casting for JSON fields
    const createdPayment = await prisma.payment.create({
      data: {
        reservationId: reservation.id,
        amount: totalAmount,
        currency: reservation.currency,
        method: 'CARD', // Default, will be updated via webhook
        status: 'PENDING',
        provider: 'PAYMONGO',
        providerPaymentId: checkoutSession.data.id,
        roomTotal: calculatedSubtotal,
        taxesTotal: taxes,
        feesTotal: serviceFee,
        guestName: `${validatedData.firstName} ${validatedData.lastName}`,
        guestEmail: validatedData.email,
        guestPhone: validatedData.phone,
        isDepositPayment: true,
        checkoutSessions: {
          create: {
            sessionId: checkoutSession.data.id,
            url: checkoutSession.data.attributes.checkout_url,
            currency: reservation.currency,
            // FIXED: Properly serialize to JSON for Prisma
            lineItems: JSON.parse(JSON.stringify(checkoutSessionRequest.line_items)) as Prisma.InputJsonValue,
            successUrl: `${baseUrl}/booking/success?session_id=${checkoutSession.data.id}`,
            cancelUrl: `${baseUrl}/booking/cancel?session_id=${checkoutSession.data.id}`,
            customerEmail: validatedData.email,
            // FIXED: Properly handle optional billing details with Prisma's null handling
            billingDetails: checkoutSessionRequest.billing ? 
              JSON.parse(JSON.stringify(checkoutSessionRequest.billing)) as Prisma.InputJsonValue : 
              Prisma.JsonNull,
            status: 'active',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            // FIXED: Properly serialize metadata
            metadata: JSON.parse(JSON.stringify(checkoutSessionRequest.metadata)) as Prisma.InputJsonValue,
          }
        },
        lineItems: {
          create: [
            {
              itemType: 'ROOM',
              itemId: validatedData.roomTypeId,
              itemName: `${roomType.name} - ${reservation.nights} night${reservation.nights > 1 ? 's' : ''}`,
              description: `Room booking for ${validatedData.adults} adult${validatedData.adults > 1 ? 's' : ''}${validatedData.children > 0 ? ` and ${validatedData.children} child${validatedData.children > 1 ? 'ren' : ''}` : ''}`,
              unitPrice: calculatedSubtotal.div(reservation.nights),
              quantity: reservation.nights,
              totalAmount: calculatedSubtotal,
              validFrom: new Date(validatedData.checkInDate),
              validTo: new Date(validatedData.checkOutDate),
            },
            ...(taxes.greaterThan(0) ? [{
              itemType: 'TAX' as const,
              itemName: 'Government Tax',
              description: 'Required government taxes and fees',
              unitPrice: taxes,
              quantity: 1,
              totalAmount: taxes,
              taxAmount: taxes,
            }] : []),
            ...(serviceFee.greaterThan(0) ? [{
              itemType: 'FEE' as const,
              itemName: 'Service Fee',
              description: 'Hotel service fee',
              unitPrice: serviceFee,
              quantity: 1,
              totalAmount: serviceFee,
            }] : [])
          ]
        }
      },
      include: {
        lineItems: true,
        checkoutSessions: true
      }
    });

    await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        paymentIntentId: createdPayment.id,
        paymentProvider: 'PAYMONGO',
        paymentStatus: 'AWAITING_PAYMENT_METHOD'
      }
    });

    const response: CreateReservationResponse = {
      reservationId: reservation.id,
      confirmationNumber: reservation.confirmationNumber,
      checkoutUrl: checkoutSession.data.attributes.checkout_url,
      paymentSessionId: checkoutSession.data.id
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error creating reservation with PayMongo:', error);

    if (error instanceof z.ZodError) {
      const validationErrors = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return NextResponse.json({
        error: 'Validation failed',
        details: `Invalid data: ${validationErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`
      }, { status: 400 });
    }

    if (error instanceof Error) {
      return NextResponse.json({
        error: 'Failed to create reservation',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      error: 'Failed to create reservation',
      details: 'Unknown error occurred'
    }, { status: 500 });
  }
}