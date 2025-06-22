import { PAYMENT_CONFIG } from '../config/payment';
import CryptoJS from 'crypto-js';

interface RoboKassaPaymentData {
  amount: number;
  currency: 'RUB' | 'BTC' | 'ETH' | 'USDT';
  orderId: string;
  description: string;
  email?: string;
}

interface RoboKassaResponse {
  success: boolean;
  paymentUrl?: string;
  error?: string;
}

export class RoboKassaService {
  private generateSignature(params: Record<string, string | number>): string {
    const { merchantLogin, password1 } = PAYMENT_CONFIG.robokassa;
    
    const signatureString = `${merchantLogin}:${params.OutSum}::${password1}`;
    
    console.log('Signature string:', signatureString);
    const signature = this.md5(signatureString);
    console.log('Generated signature:', signature);
    
    return signature;
  }

  private md5(str: string): string {
    return CryptoJS.MD5(str).toString();
  }

  public createPayment(data: RoboKassaPaymentData): RoboKassaResponse {
    try {
      const { merchantLogin, baseUrl, testMode } = PAYMENT_CONFIG.robokassa;
      
      if (!merchantLogin) {
        throw new Error('Не указан MERCHANT_LOGIN');
      }

      const params: Record<string, any> = {
        MerchantLogin: merchantLogin,
        OutSum: Math.round(data.amount).toString(),
        Description: data.description
      };

      params.SignatureValue = this.generateSignature(params);

      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

      const paymentUrl = `${baseUrl}?${queryString}`;

      return {
        success: true,
        paymentUrl
      };
    } catch (error) {
      console.error('RoboKassa error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка создания платежа'
      };
    }
  }

  public verifyCallback(params: Record<string, string>): boolean {
    const { password2 } = PAYMENT_CONFIG.robokassa;
    const { OutSum, InvId, SignatureValue } = params;
    
    const signatureString = `${OutSum}:${InvId}:${password2}`;
    const expectedSignature = this.md5(signatureString);
    
    return expectedSignature.toLowerCase() === SignatureValue.toLowerCase();
  }
} 