import { PAYMENT_CONFIG } from '../config/payment';

interface StripePaymentData {
  amount: number;
  currency: 'eur';
  orderId: string;
  description: string;
  email?: string;
}

interface StripeResponse {
  success: boolean;
  clientSecret?: string;
  checkoutUrl?: string;
  error?: string;
}

export class StripeService {
  private async makeRequest(url: string, options: RequestInit): Promise<any> {
    const { secretKey } = PAYMENT_CONFIG.stripe;
    
    const finalHeaders = {
      ...options.headers,
      'Authorization': `Bearer ${secretKey}`,
    };
    
    const response = await fetch(url, {
      ...options,
      headers: finalHeaders
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  public async createCheckoutSession(data: StripePaymentData): Promise<StripeResponse> {
    try {
      const amountInCents = Math.round(data.amount * 100);
      
      const params = new URLSearchParams({
        'success_url': `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${window.location.origin}/payment/cancel`,
        'payment_method_types[0]': 'card',
        'mode': 'payment',
        'line_items[0][price_data][currency]': data.currency,
        'line_items[0][price_data][product_data][name]': 'Услуги Digital Nomad',
        'line_items[0][price_data][product_data][description]': data.description,
        'line_items[0][price_data][unit_amount]': amountInCents.toString(),
        'line_items[0][quantity]': '1',
        'metadata[orderId]': data.orderId
      });

      if (data.email) {
        params.append('customer_email', data.email);
      }

      const session = await this.makeRequest(
        'https://api.stripe.com/v1/checkout/sessions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        }
      );

      return {
        success: true,
        checkoutUrl: session.url
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка создания сессии оплаты'
      };
    }
  }

  public async retrieveSession(sessionId: string): Promise<any> {
    try {
      return await this.makeRequest(
        `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Ошибка получения сессии');
    }
  }
} 