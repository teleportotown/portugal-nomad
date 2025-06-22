import { PAYMENT_CONFIG } from '../config/payment';

interface NOWPaymentsPaymentData {
  amount: number;
  currency: 'BTC' | 'ETH' | 'USDT' | 'TRX';
  orderId: string;
  description: string;
  email?: string;
}

interface NOWPaymentsResponse {
  success: boolean;
  paymentUrl?: string;
  paymentId?: string;
  payAddress?: string;
  error?: string;
}

interface NOWPaymentsPayment {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  ipn_callback_url?: string;
  created_at: string;
  updated_at: string;
}

export class NOWPaymentsService {
  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any, usePublicKey: boolean = false): Promise<any> {
    const { apiKey, publicKey, baseUrl } = PAYMENT_CONFIG.nowpayments;
    
    const keyToUse = usePublicKey ? publicKey : apiKey;
    
    if (!keyToUse) {
      throw new Error(`NOWPayments ${usePublicKey ? 'Public' : 'API'} key не настроен`);
    }

    const headers: Record<string, string> = {
      'x-api-key': keyToUse,
      'Content-Type': 'application/json'
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (method === 'POST' && data) {
      config.body = JSON.stringify(data);
    }

    try {
      console.log(`NOWPayments request: ${method} ${baseUrl}${endpoint}`);
      console.log(`Using ${usePublicKey ? 'Public' : 'API'} key: ${keyToUse?.substring(0, 8)}...`);
      
      const response = await fetch(`${baseUrl}${endpoint}`, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        let errorDetails = '';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          errorDetails = JSON.stringify(errorData, null, 2);
        } catch {
          const errorText = await response.text();
          errorDetails = errorText;
          errorMessage = errorText || errorMessage;
        }
        
        console.error('NOWPayments API error response:', errorDetails);
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('NOWPayments API error:', error);
      throw error;
    }
  }

  public async checkStatus(): Promise<boolean> {
    try {
      const { baseUrl } = PAYMENT_CONFIG.nowpayments;
      const response = await fetch(`${baseUrl}/status`);
      
      if (response.ok) {
        const data = await response.json();
        return data.message === 'OK';
      }
      return false;
    } catch (error) {
      console.error('NOWPayments status check failed:', error);
      return false;
    }
  }

  public async getAvailableCurrencies(): Promise<string[]> {
    try {
      try {
        const response = await this.makeRequest('/currencies', 'GET', undefined, true);
        return response.currencies || ['BTC', 'ETH', 'USDT', 'TRX'];
      } catch (error) {
        console.log('Trying currencies with API key...');
        const response = await this.makeRequest('/currencies', 'GET', undefined, false);
        return response.currencies || ['BTC', 'ETH', 'USDT', 'TRX'];
      }
    } catch (error) {
      console.error('Error getting currencies:', error);
      return ['BTC', 'ETH', 'USDT', 'TRX'];
    }
  }

  public async getMinimumAmount(currency: string): Promise<number> {
    try {
      const response = await this.makeRequest(`/min-amount?currency_from=eur&currency_to=${currency.toLowerCase()}`);
      return response.min_amount || 0.0001;
    } catch (error) {
      console.error('Error getting minimum amount:', error);
      return 0.0001;
    }
  }

  public async getEstimatedPrice(amount: number, currencyFrom: string, currencyTo: string): Promise<number> {
    try {
      const response = await this.makeRequest(`/estimate?amount=${amount}&currency_from=${currencyFrom}&currency_to=${currencyTo}`);
      return response.estimated_amount || amount;
    } catch (error) {
      console.error('Error getting estimated price:', error);
      return amount;
    }
  }

  public async createPayment(data: NOWPaymentsPaymentData): Promise<NOWPaymentsResponse> {
    try {
      const isApiUp = await this.checkStatus();
      if (!isApiUp) {
        throw new Error('NOWPayments API недоступен');
      }

      const paymentData = {
        price_amount: data.amount,
        price_currency: 'eur',
        pay_currency: data.currency.toLowerCase(),
        order_id: data.orderId,
        order_description: data.description,
        ipn_callback_url: `${window.location.origin}/api/nowpayments/callback`,
        success_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/payment/cancel`
      };

      console.log('Creating NOWPayments payment for', data.currency, 'with data:', paymentData);

      const response = await this.makeRequest('/invoice', 'POST', paymentData);
      
      console.log('NOWPayments response:', response);

      return {
        success: true,
        paymentId: response.id || response.payment_id,
        payAddress: response.pay_address,
        paymentUrl: response.invoice_url || `https://nowpayments.io/payment/?iid=${response.id || response.payment_id}`
      };
    } catch (error) {
      console.error('NOWPayments error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка создания платежа'
      };
    }
  }

  public async getPaymentStatus(paymentId: string): Promise<NOWPaymentsPayment | null> {
    try {
      const response = await this.makeRequest(`/payment/${paymentId}`);
      return response;
    } catch (error) {
      console.error('Error getting payment status:', error);
      return null;
    }
  }

  public verifyCallback(data: any): boolean {
    return true;
  }
} 