// /app/api/webhooks/paymongo/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { 
  WebhookEvent, 
  CheckoutSessionWebhookData, 
  isWebhookEvent,
  isCheckoutSessionEvent,
  isPaymentIntentEvent,
  isSuccessfulPaymentEvent,
  isCheckoutSessionData,
  isPaymentIntentData,
  getPaymentIntentFromSession,
  getPaymentDetails,
  getSourceDetails,
  getLastPaymentError,
  getMetadataValue,
  calculateTotalFromLineItems,
  getPaymentMethodForDB,
  getPaymongoPaymentTypeForDB,
  isCardSource,
  serializeForPrismaJson
} from '@/types/paymongo-webhook-extended';

interface WebhookResponse {
  received: boolean;
  processed?: boolean;
  error?: string;
}

// Helper function to get IP address
function getClientIP(req: NextRequest, headersList: Headers): string {
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown'
  );
}

// Signature verification function
function verifyPaymongoSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  try {
    const parts = signatureHeader.split(',');
    const timestamp = parts.find(part => part.startsWith('t='))?.split('=')[1];
    const testSignature = parts.find(part => part.startsWith('te='))?.split('=')[1];
    const liveSignature = parts.find(part => part.startsWith('li='))?.split('=')[1];

    if (!timestamp || !(testSignature || liveSignature)) {
      console.error('Signature header is missing required parts (t, te, or li).');
      return false;
    }
    
    const signatureToVerify = liveSignature || testSignature;
    
    if (!signatureToVerify) {
        console.error('No valid signature found in header.');
        return false;
    }

    const signedPayload = `${timestamp}.${rawBody}`;

    const expectedSignature = crypto
      .createHmac('sha256', secret) 
      .update(signedPayload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signatureToVerify),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('An error occurred during signature verification:', error);
    return false;
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<WebhookResponse>> {
  let webhookEventRecord: { id: string } | null = null;
  
  try {
    const payload = await req.text();
    const headersList = await headers();
    const signature = headersList.get('paymongo-signature');
    
    if (!signature || !process.env.PAYMONGO_WEBHOOK_SECRET) {
      console.error('Webhook Error: Missing signature or secret.');
      return NextResponse.json({ received: false, error: 'Configuration error' }, { status: 400 });
    }

    const isValid = verifyPaymongoSignature(payload, signature, process.env.PAYMONGO_WEBHOOK_SECRET);
    if (!isValid) {
      console.error('Invalid webhook signature received.');
      return NextResponse.json({ received: false, error: 'Invalid signature' }, { status: 401 });
    }

    const ipAddress = getClientIP(req, headersList);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userAgent = headersList.get('user-agent');
    const parsedEvent: unknown = JSON.parse(payload);
    
    if (!isWebhookEvent(parsedEvent)) {
      console.error('Invalid webhook event structure.');
      return NextResponse.json({ received: false, error: 'Invalid event structure' }, { status: 400 });
    }

    const event: WebhookEvent = parsedEvent;
    const eventType = event.data.attributes.type;
    const resourceId = event.data.attributes.data.id;
    
    console.log('✅ Received VALID webhook event:', eventType, 'for resource:', resourceId);

    // Check if we already processed this webhook event
    const existingWebhookEvent = await prisma.paymongoWebhookEvent.findUnique({
      where: { eventId: event.data.id }
    });

    if (existingWebhookEvent && existingWebhookEvent.status === 'processed') {
      console.log('Webhook event already processed:', event.data.id);
      return NextResponse.json({ received: true, processed: true });
    }

    const headersObject: Record<string, string> = {};
    headersList.forEach((value, key) => { headersObject[key] = value; });

    // Create or update webhook event record using your schema
    webhookEventRecord = await prisma.paymongoWebhookEvent.upsert({
      where: { eventId: event.data.id },
      update: { 
        retryCount: { increment: 1 }, 
        status: 'processing',
        signature: signature
      },
      create: {
        eventId: event.data.id,
        eventType: eventType,
        resourceType: event.data.attributes.data.type,
        resourceId: resourceId,
        signature: signature,
        data: serializeForPrismaJson(event),
        headers: serializeForPrismaJson(headersObject),
        ipAddress: ipAddress,
        status: 'processing',
        livemode: event.data.attributes.livemode || false
      }
    });
    
    let processed = false;
    
    if (isCheckoutSessionEvent(eventType)) {
      if (isSuccessfulPaymentEvent(eventType)) {
        await handleCheckoutSessionSuccess(event, webhookEventRecord.id);
        processed = true;
      } else if (eventType === 'checkout_session.payment.failed') {
        await handleCheckoutSessionFailed(event, webhookEventRecord.id);
        processed = true;
      }
    } else if (isPaymentIntentEvent(eventType)) {
        await handlePaymentIntentSuccess(event, webhookEventRecord.id);
        processed = true;
    } else {
      console.log('Unhandled webhook event type:', eventType);
    }

    // Update webhook event status
    await prisma.paymongoWebhookEvent.update({
      where: { id: webhookEventRecord.id },
      data: {
        processedAt: new Date(),
        status: processed ? 'processed' : 'ignored'
      }
    });

    return NextResponse.json({ received: true, processed });
    
  } catch (error) {
    console.error('Fatal webhook processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (webhookEventRecord) {
      await prisma.paymongoWebhookEvent.update({
        where: { id: webhookEventRecord.id },
        data: { status: 'failed', error: errorMessage }
      }).catch(updateError => console.error('Failed to update webhook record to failed status:', updateError));
    }
    
    return NextResponse.json({ received: true, processed: false, error: errorMessage }, { status: 500 });
  }
}

async function handleCheckoutSessionSuccess(event: WebhookEvent, webhookEventId: string): Promise<void> {
  try {
    const checkoutSessionId = event.data.attributes.data.id;
    const sessionData = event.data.attributes.data.attributes;
    
    if (!isCheckoutSessionData(sessionData)) {
      throw new Error('Invalid checkout session data structure in webhook.');
    }
    
    const typedSessionData: CheckoutSessionWebhookData = sessionData;
    console.log('Processing successful checkout session payment:', checkoutSessionId);
    
    // Get reservation ID from metadata
    const reservationId = getMetadataValue(typedSessionData.metadata, 'reservation_id');
    if (!reservationId) {
      throw new Error('No reservation_id found in checkout session metadata.');
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { guest: true }
    });

    if (!reservation) {
      throw new Error(`Reservation not found: ${reservationId}`);
    }

    const paymentIntent = getPaymentIntentFromSession(typedSessionData);
    const paymentIntentId = paymentIntent?.id;
    const totalAmount = calculateTotalFromLineItems(typedSessionData.line_items) / 100;
    
    // Check if payment already exists
    let payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { providerPaymentId: checkoutSessionId },
          ...(paymentIntentId ? [{ providerPaymentId: paymentIntentId }] : [])
        ]
      }
    });

    if (!payment) {
      // Create new payment record
      payment = await prisma.payment.create({
        data: {
          reservationId: reservation.id,
          amount: totalAmount,
          currency: typedSessionData.line_items[0]?.currency?.toUpperCase() || 'PHP',
          method: 'CARD', // Will be updated based on actual payment method
          status: 'PROCESSING',
          provider: 'PAYMONGO',
          providerPaymentId: paymentIntentId || checkoutSessionId,
          guestName: reservation.guest?.firstName && reservation.guest?.lastName 
            ? `${reservation.guest.firstName} ${reservation.guest.lastName}`
            : undefined,
          guestEmail: reservation.guest?.email,
          guestPhone: reservation.guest?.phone,
          providerMetadata: serializeForPrismaJson({
            checkout_session_id: checkoutSessionId,
            line_items: typedSessionData.line_items,
            client_key: typedSessionData.client_key
          })
        }
      });
    }

    // Prepare payment update data
    interface PaymentUpdateData {
      status: 'SUCCEEDED';
      processedAt: Date;
      capturedAt: Date;
      providerMetadata: Prisma.InputJsonValue;
      method?: 'CARD' | 'E_WALLET' | 'BANK_TRANSFER' | 'QR_CODE';
    }

    const updateData: PaymentUpdateData = {
      status: 'SUCCEEDED',
      processedAt: new Date(),
      capturedAt: new Date(),
      providerMetadata: serializeForPrismaJson({
        ...((payment.providerMetadata as Record<string, unknown>) || {}),
        webhook_event_id: webhookEventId,
        processed_at: new Date().toISOString()
      })
    };

    // Process payment intent details if available
    if (paymentIntent && isPaymentIntentData(paymentIntent.attributes)) {
      const paymentDetails = getPaymentDetails(paymentIntent.attributes);
      
      if (paymentDetails) {
        // Update payment with detailed information
        const source = getSourceDetails(paymentDetails);
        updateData.method = getPaymentMethodForDB(source);
        
        // Create PaymongoPayment record
        await prisma.paymongoPayment.upsert({
          where: { paymentId: payment.id },
          create: {
            paymentId: payment.id,
            paymentIntentId: paymentIntentId || '',
            paymentMethodId: paymentIntent.attributes.payment_method?.id,
            sourceId: paymentIntent.attributes.source?.id,
            checkoutSessionId: checkoutSessionId,
            paymongoStatus: paymentIntent.attributes.status,
            paymentMethodType: getPaymongoPaymentTypeForDB(source),
            clientKey: typedSessionData.client_key,
            billingDetails: serializeForPrismaJson(paymentIntent.attributes.billing || {}),
            metadata: serializeForPrismaJson(paymentIntent.attributes.metadata || {}),
            applicationFee: paymentIntent.attributes.application_fee ? paymentIntent.attributes.application_fee / 100 : null,
            processingFee: paymentIntent.attributes.fee ? paymentIntent.attributes.fee / 100 : null
          },
          update: {
            paymongoStatus: paymentIntent.attributes.status,
            paymentMethodType: getPaymongoPaymentTypeForDB(source),
            billingDetails: serializeForPrismaJson(paymentIntent.attributes.billing || {}),
            metadata: serializeForPrismaJson(paymentIntent.attributes.metadata || {})
          }
        });

        // Create card details if it's a card payment
        if (isCardSource(source)) {
          const paymongoPayment = await prisma.paymongoPayment.findUnique({
            where: { paymentId: payment.id }
          });
          
          if (paymongoPayment) {
            await prisma.paymongoCard.upsert({
              where: { paymongoPaymentId: paymongoPayment.id },
              create: {
                paymongoPaymentId: paymongoPayment.id,
                brand: source.brand || 'unknown',
                last4: source.last4 || '0000',
                expMonth: source.exp_month || 12,
                expYear: source.exp_year || 2025,
                country: source.country
              },
              update: {
                brand: source.brand || 'unknown',
                last4: source.last4 || '0000',
                country: source.country
              }
            });
          }
        }
      }
    }

    // Update the payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: updateData
    });

    // Create checkout session record
    await prisma.paymongoCheckoutSession.upsert({
      where: { sessionId: checkoutSessionId },
      create: {
        sessionId: checkoutSessionId,
        paymentId: payment.id,
        url: typedSessionData.checkout_url || '',
        currency: typedSessionData.line_items[0]?.currency?.toUpperCase() || 'PHP',
        lineItems: serializeForPrismaJson(typedSessionData.line_items),
        successUrl: typedSessionData.success_url || '',
        cancelUrl: typedSessionData.cancel_url || '',
        customerEmail: reservation.guest?.email,
        billingDetails: serializeForPrismaJson(typedSessionData.billing || {}),
        status: 'paid',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        metadata: serializeForPrismaJson(typedSessionData.metadata || {})
      },
      update: {
        status: 'paid',
        paymentId: payment.id
      }
    });

    // Update reservation status
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        paidAt: new Date()
      }
    });
    
    console.log(`✅ Payment confirmed for reservation ${reservationId}`);
    
  } catch (error) {
    console.error('Error in handleCheckoutSessionSuccess:', error);
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleCheckoutSessionFailed(event: WebhookEvent, webhookEventId: string): Promise<void> {
  try {
    const sessionData = event.data.attributes.data.attributes;
    
    if (!isCheckoutSessionData(sessionData)) {
      throw new Error('Invalid checkout session data structure for a failed event.');
    }
    
    const typedSessionData: CheckoutSessionWebhookData = sessionData;
    
    const reservationId = getMetadataValue(typedSessionData.metadata, 'reservation_id');
    if (!reservationId) {
      throw new Error('No reservation_id found for a failed event.');
    }

    const paymentIntent = getPaymentIntentFromSession(typedSessionData);
    let failureMessage = 'Unknown reason';
    
    if (paymentIntent && isPaymentIntentData(paymentIntent.attributes)) {
      const lastError = getLastPaymentError(paymentIntent.attributes);
      if (lastError) {
        failureMessage = lastError.detail || 'Payment failed';
      }
    }

    // Find and update existing payment
    const payment = await prisma.payment.findFirst({
      where: {
        reservationId: reservationId,
        providerPaymentId: event.data.attributes.data.id
      }
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureCode: 'payment_failed',
          failureMessage: failureMessage,
          processedAt: new Date()
        }
      });
    }
    
    // Update reservation
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        paymentStatus: 'FAILED',
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: `Payment failed: ${failureMessage}`
      }
    });
    
    console.log(`Reservation ${reservationId} cancelled due to payment failure.`);
    
  } catch (error) {
    console.error('Error in handleCheckoutSessionFailed:', error);
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handlePaymentIntentSuccess(event: WebhookEvent, webhookEventId: string): Promise<void> {
  console.log("Handling successful payment intent...");
  
  try {
    const paymentIntentData = event.data.attributes.data.attributes;
    
    if (!isPaymentIntentData(paymentIntentData)) {
      throw new Error('Invalid payment intent data structure.');
    }

    const paymentIntentId = event.data.attributes.data.id;
    
    // Find existing payment by provider payment ID
    const payment = await prisma.payment.findFirst({
      where: { providerPaymentId: paymentIntentId }
    });

    if (payment) {
      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCEEDED',
          processedAt: new Date(),
          capturedAt: new Date()
        }
      });

      // Update corresponding reservation
      await prisma.reservation.update({
        where: { id: payment.reservationId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          paidAt: new Date()
        }
      });
    }
    
  } catch (error) {
    console.error('Error in handlePaymentIntentSuccess:', error);
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handlePaymentIntentFailed(event: WebhookEvent, webhookEventId: string): Promise<void> {
    console.log("Handling failed payment intent...");
    
    try {
      const paymentIntentId = event.data.attributes.data.id;
      
      // Find existing payment
      const payment = await prisma.payment.findFirst({
        where: { providerPaymentId: paymentIntentId }
      });

      if (payment) {
        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            failureCode: 'payment_intent_failed',
            failureMessage: 'Payment intent failed',
            processedAt: new Date()
          }
        });

        // Update corresponding reservation
        await prisma.reservation.update({
          where: { id: payment.reservationId },
          data: {
            paymentStatus: 'FAILED',
            status: 'CANCELLED',
            cancelledAt: new Date(),
            cancellationReason: 'Payment intent failed'
          }
        });
      }
      
    } catch (error) {
      console.error('Error in handlePaymentIntentFailed:', error);
      throw error;
    }
}