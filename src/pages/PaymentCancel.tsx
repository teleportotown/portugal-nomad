import React from 'react';
import { Link } from 'react-router-dom';

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50/30 to-orange-50/30 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-light text-gray-800 mb-4">Оплата отменена</h1>
          <p className="text-gray-600 mb-6">
            Вы отменили процесс оплаты. Заказ не был создан.
          </p>
          
          <div className="space-y-3">
            <Link 
              to="/" 
              className="block w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Попробовать снова
            </Link>
            <p className="text-xs text-gray-500">
              Если у вас есть вопросы, свяжитесь с нами
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel; 