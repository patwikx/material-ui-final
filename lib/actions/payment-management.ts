'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { PaymentStatus, PaymentMethod } from '@prisma/client';


export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
}

export interface PaymentData {
  id: string;
  reservationId: string;
  amount: string;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  roomTotal: string;
  addonsTotal: string;
  servicesTotal: string;
  taxesTotal: string;
  feesTotal: string;
  discountsTotal: string;
  depositAmount: string;
  balanceAmount: string;
  paymentContext: Record<string, unknown> | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  isDepositPayment: boolean;
  isBalancePayment: boolean;
  isIncidentalPayment: boolean;
  providerPaymentId: string;
  providerMetadata: Record<string, unknown> | null;
  failureCode: string | null;
  failureMessage: string | null;
  refundedAmount: string | null;
  refundReason: string | null;
  refundedAt: Date | null;
  transactionDate: Date;
  processedAt: Date | null;
  authorizedAt: Date | null;
  capturedAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
  notes: string | null;
  internalNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  reservation: {
    id: string;
    confirmationNumber: string;
    guest: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    businessUnit: {
      id: string;
      name: string;
      displayName: string;
    };
  };
  lineItems: Array<{
    id: string;
    itemType: string;
    itemId: string | null;
    itemName: string;
    description: string | null;
    unitPrice: string;
    quantity: number;
    totalAmount: string;
    taxRate: string | null;
    taxAmount: string;
    discountRate: string | null;
    discountAmount: string;
    validFrom: Date | null;
    validTo: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  // FIX: Add nested paymongoPayment field to the interface
  paymongoPayment: { paymentIntentId: string } | null;
}

export async function getAllPayments(businessUnitId?: string): Promise<PaymentData[]> {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        // FIX: Added businessUnitId to the where clause to filter payments
        ...(businessUnitId && { reservation: { businessUnitId } }),
      },
      include: {
        reservation: {
          select: {
            id: true,
            confirmationNumber: true,
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            businessUnit: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
        lineItems: {
          select: {
            id: true,
            itemType: true,
            itemId: true,
            itemName: true,
            description: true,
            quantity: true,
            unitPrice: true,
            totalAmount: true,
            taxRate: true,
            taxAmount: true,
            discountRate: true,
            discountAmount: true,
            validFrom: true,
            validTo: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        paymongoPayment: {
          select: {
            paymentIntentId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return payments.map(payment => ({
      ...payment,
      amount: payment.amount.toString(),
      roomTotal: payment.roomTotal.toString(),
      addonsTotal: payment.addonsTotal.toString(),
      servicesTotal: payment.servicesTotal.toString(),
      taxesTotal: payment.taxesTotal.toString(),
      feesTotal: payment.feesTotal.toString(),
      discountsTotal: payment.discountsTotal.toString(),
      depositAmount: payment.depositAmount.toString(),
      balanceAmount: payment.balanceAmount.toString(),
      refundedAmount: payment.refundedAmount?.toString() ?? null,
      paymentContext: payment.paymentContext as Record<string, unknown> | null,
      providerMetadata: payment.providerMetadata as Record<string, unknown> | null,
      lineItems: payment.lineItems.map(item => ({
        ...item,
        unitPrice: item.unitPrice.toString(),
        totalAmount: item.totalAmount.toString(),
        taxRate: item.taxRate?.toString() ?? null,
        taxAmount: item.taxAmount.toString(),
        discountRate: item.discountRate?.toString() ?? null,
        discountAmount: item.discountAmount.toString(),
      })),
      // FIX: Map the nested paymongoPayment field
      paymongoPayment: payment.paymongoPayment ? { paymentIntentId: payment.paymongoPayment.paymentIntentId } : null,
    }));
  } catch (error) {
    console.error('Error fetching all payments:', error);
    return [];
  }
}

export async function getPaymentById(id: string): Promise<PaymentData | null> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        reservation: {
          select: {
            id: true,
            confirmationNumber: true,
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            businessUnit: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
        lineItems: {
          select: {
            id: true,
            itemType: true,
            itemId: true,
            itemName: true,
            description: true,
            quantity: true,
            unitPrice: true,
            totalAmount: true,
            taxRate: true,
            taxAmount: true,
            discountRate: true,
            discountAmount: true,
            validFrom: true,
            validTo: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        // FIX: Added paymongoPayment include
        paymongoPayment: {
          select: {
            paymentIntentId: true
          }
        }
      },
    });

    if (!payment) return null;

    return {
      ...payment,
      amount: payment.amount.toString(),
      roomTotal: payment.roomTotal.toString(),
      addonsTotal: payment.addonsTotal.toString(),
      servicesTotal: payment.servicesTotal.toString(),
      taxesTotal: payment.taxesTotal.toString(),
      feesTotal: payment.feesTotal.toString(),
      discountsTotal: payment.discountsTotal.toString(),
      depositAmount: payment.depositAmount.toString(),
      balanceAmount: payment.balanceAmount.toString(),
      refundedAmount: payment.refundedAmount?.toString() ?? null,
      paymentContext: payment.paymentContext as Record<string, unknown> | null,
      providerMetadata: payment.providerMetadata as Record<string, unknown> | null,
      lineItems: payment.lineItems.map(item => ({
        ...item,
        unitPrice: item.unitPrice.toString(),
        totalAmount: item.totalAmount.toString(),
        taxRate: item.taxRate?.toString() ?? null,
        taxAmount: item.taxAmount.toString(),
        discountRate: item.discountRate?.toString() ?? null,
        discountAmount: item.discountAmount.toString(),
      })),
      // FIX: Map the nested paymongoPayment field
      paymongoPayment: payment.paymongoPayment ? { paymentIntentId: payment.paymongoPayment.paymentIntentId } : null,
    };
  } catch (error) {
    console.error('Error fetching payment by ID:', error);
    return null;
  }
}

export async function updatePaymentStatus(id: string, status: PaymentStatus): Promise<ActionResult> {
  try {
    await prisma.payment.update({
      where: { id },
      data: {
        status,
        processedAt: status === PaymentStatus.SUCCEEDED || status === PaymentStatus.PAID ? new Date() : null,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/operations/payments');

    return {
      success: true,
      message: `Payment status updated to ${status.toLowerCase()}`,
    };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return {
      success: false,
      message: 'Failed to update payment status',
    };
  }
}

export async function refundPayment(id: string, reason?: string): Promise<ActionResult> {
  try {
    await prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.REFUNDED,
        // Using the 'notes' field as there is no 'description' field in the schema
        refundReason: reason,
        refundedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/operations/payments');

    return {
      success: true,
      message: 'Payment refunded successfully',
    };
  } catch (error) {
    console.error('Error refunding payment:', error);
    return {
      success: false,
      message: 'Failed to refund payment',
    };
  }
}