import React, { useState } from 'react';
import { useToast } from './ui/use-toast';
import { StripeService } from '../services/stripe';
import { NOWPaymentsService } from '../services/nowpayments';
import { RoboKassaService } from '../services/robokassa';
import { PAYMENT_CONFIG } from '../config/payment';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  provider: 'stripe' | 'robokassa' | 'nowpayments';
}

interface PaymentIntegrationProps {
  totalAmount: number;
  orderData: {
    services: Array<{ name: string; price: number }>;
    discounts: Array<{ name: string; amount: number }>;
    contactInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
}

export function PaymentIntegration({ totalAmount, orderData }: PaymentIntegrationProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const stripeService = new StripeService();
  const nowpaymentsService = new NOWPaymentsService();
  const robokassaService = new RoboKassaService();

  React.useEffect(() => {
    nowpaymentsService.debugAvailableCurrencies();
  }, []);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'eur',
      name: 'Оплатить евро',
      icon: '€',
      color: 'from-green-500 to-green-600',
      description: 'Оплата в евро через банковские карты',
      provider: 'stripe'
    },
    {
      id: 'rub',
      name: 'Оплатить рубли',
      icon: '₽',
      color: 'from-blue-500 to-blue-600',
      description: 'Оплата российскими рублями через СБП или банковскую карту',
      provider: 'robokassa'
    },
    {
      id: 'crypto',
      name: 'Оплатить крипто',
      icon: '₮',
      color: 'from-purple-500 to-purple-600',
      description: 'Оплата криптовалютой USDT (TRC20)',
      provider: 'nowpayments'
    }
  ];

  const getConvertedAmount = (methodId: string) => {
    const { eurToRub, eurToUsdt } = PAYMENT_CONFIG.exchangeRates;
    const rates = { rub: eurToRub, eur: 1, crypto: eurToUsdt };
    const symbols = { rub: '₽', eur: '€', crypto: 'USDT' };
    
    const calculatedAmount = totalAmount * rates[methodId as keyof typeof rates];
    let formattedAmount: string;
    
    if (methodId === 'crypto') {
      formattedAmount = calculatedAmount.toFixed(2);
    } else if (methodId === 'rub') {
      formattedAmount = Math.round(calculatedAmount).toString();
    } else {
      formattedAmount = calculatedAmount.toFixed(2);
    }
    
    return {
      amount: formattedAmount,
      symbol: symbols[methodId as keyof typeof symbols]
    };
  };

  const handlePayment = async (methodId: string, provider: PaymentMethod['provider']) => {
    setSelectedMethod(methodId);
    setShowDetails(true);
    setIsProcessing(true);
    
    try {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const description = `Услуги визы цифрового кочевника: ${orderData.services.map(s => s.name).join(', ')}`;

      if (provider === 'stripe') {
        const result = await stripeService.createCheckoutSession({
          amount: totalAmount,
          currency: 'eur',
          orderId,
          description,
          email: orderData.contactInfo.email
        });

        if (result.success && result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        } else {
          throw new Error(result.error || 'Ошибка создания сессии Stripe');
        }
      } else if (provider === 'robokassa') {
        const rubAmount = Math.round(totalAmount * PAYMENT_CONFIG.exchangeRates.eurToRub);
        
        const result = robokassaService.createPayment({
          amount: rubAmount,
          currency: 'RUB',
          orderId,
          description,
          email: orderData.contactInfo.email
        });

        if (result.success && result.paymentUrl) {
          window.location.href = result.paymentUrl;
        } else {
          throw new Error(result.error || 'Ошибка создания платежа RoboKassa');
        }
      } else {
        const result = await nowpaymentsService.createPayment({
          amount: totalAmount,
          currency: 'USDTTRC20',
          orderId,
          description,
          email: orderData.contactInfo.email
        });

        if (result.success && result.paymentUrl) {
          window.location.href = result.paymentUrl;
        } else {
          throw new Error(result.error || 'Ошибка создания платежа NOWPayments');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Ошибка оплаты',
        description: error instanceof Error ? error.message : 'Произошла ошибка при создании платежа',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setShowDetails(false);
      setSelectedMethod('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Payment Methods */}
      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const converted = getConvertedAmount(method.id);
          const isSelected = selectedMethod === method.id;
          
          return (
            <div key={method.id} className="relative">
              <button
                onClick={() => handlePayment(method.id, method.provider)}
                disabled={isProcessing}
                className={`w-full p-4 rounded-2xl bg-gradient-to-r ${method.color} text-white font-light 
                  shadow-2xl transition-all duration-300 active:scale-95 hover:-translate-y-0.5
                  ${isSelected ? 'ring-4 ring-white/50' : ''} 
                  ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-3xl'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{method.name}</div>
                      <div className="text-xs opacity-80">{method.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {converted.amount} {converted.symbol}
                    </div>
                    <div className="text-xs opacity-80">
                      ≈ {totalAmount}€
                    </div>
                  </div>
                </div>
              </button>

              {/* Payment Processing Animation */}
              {isSelected && showDetails && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center space-x-2 text-white">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span className="font-light">Обработка платежа...</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment Security Info */}
      <div className="mt-6 p-4 rounded-2xl bg-gray-50/80 backdrop-blur-xl">
        <div className="flex items-center space-x-2 text-gray-600">
          <span className="text-green-500">🔒</span>
          <span className="text-xs font-light">
            Все платежи защищены 256-битным SSL шифрованием
          </span>
        </div>
      </div>
    </div>
  );
}
