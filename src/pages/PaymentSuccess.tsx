import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { StripeService } from '../services/stripe';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const sessionId = searchParams.get('session_id');
  const stripeService = new StripeService();

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        setError('Отсутствует ID сессии');
        setLoading(false);
        return;
      }

      try {
        const session = await stripeService.retrieveSession(sessionId);
        setSessionData(session);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка получения данных');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Проверяем статус оплаты...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-pink-50/30 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-2xl font-light text-gray-800 mb-4">Ошибка</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              to="/" 
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-blue-50/30 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-2xl font-light text-gray-800 mb-4">Оплата успешна!</h1>
          <p className="text-gray-600 mb-6">
            Спасибо за оплату! Ваш заказ обрабатывается.
          </p>
          
          {sessionData && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-800 mb-2">Детали оплаты:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Сумма:</span> {sessionData.amount_total / 100} {sessionData.currency?.toUpperCase()}</p>
                <p><span className="font-medium">ID заказа:</span> {sessionData.metadata?.orderId}</p>
                <p><span className="font-medium">Email:</span> {sessionData.customer_email}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <Link 
              to="/" 
              className="block w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Вернуться на главную
            </Link>
            <p className="text-xs text-gray-500">
              Мы свяжемся с вами в ближайшее время для уточнения деталей
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 