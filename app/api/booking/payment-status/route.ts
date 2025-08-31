// app/api/admin/operations/reservations/payment-status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@prisma/client';

interface PaymentStatusResponse {
  status: 'paid' | 'pending' | 'failed' | 'cancelled';
  reservationId?: string;
  confirmationNumber?: string;
  message?: string;
  paymentDetails?: {
    amount: number;
    currency: string;
    method: string;
    provider: string;
    processedAt?: string;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse<PaymentStatusResponse | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const reservationId = searchParams.get('reservationId');

    if (!sessionId && !reservationId) {
      return NextResponse.json(
        { error: 'Either sessionId or reservationId is required' },
        { status: 400 }
      );
    }

    let reservation;

    if (sessionId) {
      // Find reservation by PayMongo session ID
      reservation = await prisma.reservation.findFirst({
        where: {
          payments: {
            some: {
              checkoutSessions: {
                some: {
                  sessionId: sessionId
                }
              }
            }
          }
        },
        include: {
          payments: {
            where: {
              checkoutSessions: {
                some: {
                  sessionId: sessionId
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              paymongoPayment: true,
              checkoutSessions: {
                where: { sessionId },
                take: 1
              }
            }
          }
        }
      });
    } else if (reservationId) {
      // Find reservation by ID
      reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              paymongoPayment: true,
              checkoutSessions: {
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            }
          }
        }
      });
    }

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    const latestPayment = reservation.payments[0];

    if (!latestPayment) {
      return NextResponse.json({
        status: 'pending' as const,
        reservationId: reservation.id,
        message: 'No payment record found',
      });
    }

    // Map your PaymentStatus enum to the expected frontend values
    let status: 'paid' | 'pending' | 'failed' | 'cancelled';
    let message: string;

    switch (latestPayment.status as PaymentStatus) {
      case 'SUCCEEDED':
      case 'PAID':
        status = 'paid';
        message = 'Payment successful! Your booking is confirmed.';
        break;
      case 'FAILED':
        status = 'failed';
        message = latestPayment.failureMessage || 'Payment failed. Please try again.';
        break;
      case 'CANCELLED':
        status = 'cancelled';
        message = 'Payment was cancelled.';
        break;
      case 'EXPIRED':
        status = 'failed';
        message = 'Payment session expired. Please try again.';
        break;
      case 'PROCESSING':
      case 'PENDING':
      case 'AWAITING_PAYMENT_METHOD':
      case 'AWAITING_NEXT_ACTION':
      default:
        status = 'pending';
        message = 'Payment is being processed...';
        break;
    }

    const paymentDetails = latestPayment ? {
      amount: latestPayment.amount.toNumber(),
      currency: latestPayment.currency,
      method: latestPayment.method,
      provider: latestPayment.provider,
      processedAt: latestPayment.processedAt?.toISOString(),
    } : undefined;

    const response: PaymentStatusResponse = {
      status,
      reservationId: reservation.id,
      confirmationNumber: reservation.confirmationNumber,
      message,
      ...(paymentDetails && { paymentDetails }),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}