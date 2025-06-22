export const PAYMENT_CONFIG = {
  robokassa: {
    merchantLogin: import.meta.env.VITE_ROBOKASSA_MERCHANT_LOGIN || '',
    password1: import.meta.env.VITE_ROBOKASSA_PASSWORD1 || '',
    password2: import.meta.env.VITE_ROBOKASSA_PASSWORD2 || '',
    testMode: import.meta.env.VITE_ROBOKASSA_TEST_MODE === 'true',
    baseUrl: 'https://auth.robokassa.ru/Merchant/Index.aspx'
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY,
    baseUrl: import.meta.env.VITE_STRIPE_TEST_MODE === 'true' 
      ? 'https://api.stripe.com/v1' 
      : 'https://api.stripe.com/v1',
    testMode: import.meta.env.VITE_STRIPE_TEST_MODE === 'true'
  },
  nowpayments: {
    apiKey: import.meta.env.VITE_NOWPAYMENTS_API_KEY || '',
    publicKey: import.meta.env.VITE_NOWPAYMENTS_PUBLIC_KEY || import.meta.env.VITE_NOWPAYMENTS_API_KEY || '',
    baseUrl: import.meta.env.VITE_NOWPAYMENTS_TEST_MODE === 'true'
      ? 'https://api.nowpayments.io/v1'  // Используем production URL даже в тестовом режиме
      : 'https://api.nowpayments.io/v1',
    testMode: import.meta.env.VITE_NOWPAYMENTS_TEST_MODE === 'true',
    // Дополнительные параметры из документации
    ipnSecret: import.meta.env.VITE_NOWPAYMENTS_IPN_SECRET || '',
    email: import.meta.env.VITE_NOWPAYMENTS_EMAIL || '',
    password: import.meta.env.VITE_NOWPAYMENTS_PASSWORD || ''
  },
  exchangeRates: {
    eurToRub: 100,
    eurToBtc: 0.000015,
    eurToEth: 0.0003,
    eurToUsdt: 1.05,
    eurToTrx: 400  // 1 EUR ≈ 400 TRX (примерный курс)
  }
}; 