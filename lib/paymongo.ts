// lib/paymongo.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
// Import the shared, more detailed types to ensure consistency
import { 
    PayMongoErrorResponse, 
    PayMongoResponse, 
    CheckoutSessionAttributes, 
    PaymentIntentAttributes,
    CreateCheckoutSessionRequest as CheckoutSessionData, // Alias for consistency
    CreatePaymentIntentRequest as PaymentIntentData // Alias for consistency
} from '@/types/paymongo-types';

// --- PayMongo Client Class ---
class PayMongoClient {
  private client: AxiosInstance;

  constructor(secretKey: string) {
    if (!secretKey) {
      throw new Error("PayMongo secret key is not provided. Please check your environment variables.");
    }
    
    this.client = axios.create({
      baseURL: 'https://api.paymongo.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
      },
    });
  }

  // Create a checkout session
  async createCheckoutSession(data: CheckoutSessionData): Promise<PayMongoResponse<CheckoutSessionAttributes>> {
    try {
      const response = await this.client.post<PayMongoResponse<CheckoutSessionAttributes>>('/checkout_sessions', {
        data: {
          attributes: data
        }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to create checkout session');
    }
  }

  // Get a checkout session status
  async getCheckoutSession(sessionId: string): Promise<PayMongoResponse<CheckoutSessionAttributes>> {
    try {
      const response = await this.client.get<PayMongoResponse<CheckoutSessionAttributes>>(`/checkout_sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to get checkout session');
    }
  }

  // Create a payment intent
  async createPaymentIntent(data: PaymentIntentData): Promise<PayMongoResponse<PaymentIntentAttributes>> {
    try {
      const response = await this.client.post<PayMongoResponse<PaymentIntentAttributes>>('/payment_intents', {
        data: {
          attributes: data
        }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Failed to create payment intent');
    }
  }

  private handleError(error: unknown, context: string): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<PayMongoErrorResponse>;
      const errorData = axiosError.response?.data;
      const errorMessage = errorData?.errors?.[0]?.detail || axiosError.message || 'Unknown PayMongo error';
      
      console.error(`PayMongo API Error (${context}):`, {
        status: axiosError.response?.status,
        data: errorData,
      });
      
      throw new Error(`PayMongo Error: ${errorMessage}`);
    } 
    
    console.error(`Unknown error in PayMongo Client (${context}):`, error);
    throw new Error('An unknown error occurred while communicating with PayMongo.');
  }
}

// Create and export a singleton instance of the PayMongo client.
export const paymongo = new PayMongoClient(process.env.PAYMONGO_SECRET_KEY!);
