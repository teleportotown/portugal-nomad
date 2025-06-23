import React, { useState } from 'react';
import { Toast, useToast } from './components/Toast';
import { FormField, useValidation } from './components/FormValidation';
import { PaymentIntegration } from './components/PaymentIntegration';
import { ChevronDown } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  selected: boolean;
  category: 'essential' | 'additional' | 'premium';
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  promoCode: string;
}

interface DiscountRule {
  type: 'bulk' | 'promo' | 'first_time' | 'seasonal';
  value: number;
  description: string;
  condition?: (services: Service[], formData?: ContactFormData) => boolean;
}

const App = () => {
  const { toasts, addToast, removeToast } = useToast();
  const { validateForm } = useValidation();

  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'Индивидуальная консультация по иммиграции',
      description: '"Вы можете обратиться к нашим экспертам с абсолютно любым волнующим вас вопросом по миграционным или бытовым темам. Никакой лишней информации, только четкие ответы на ваши вопросы и ценные рекомендации. Самые популярные запросы: ✅ Консультация: углубленный разбор и стратегия переезда для кейса повышенной сложности ✅ Консультация: аренда жилья с проверкой документов + шаблон презентации о себе для арендодателей ✅ Консультация по зачислению ребенка в государственную школу (система образования, необходимые документы для зачисления, алгоритм всех процедур подачи, получения учебников и пр.)"',
      price: 150,
      selected: false,
      category: 'essential'
    },
    {
      id: '2',
      name: 'NIF (Налоговый номер)',
      description: 'Получение португальского налогового номера (NIF) - обязательный документ для всех резидентов и нерезидентов, ведущих деятельность в Португалии. Включает подачу документов, сопровождение процесса и получение готового NIF. Срок 7 рабочих дней',
      price: 120,
      selected: false,
      category: 'essential'
    },
    {
      id: '3',
      name: 'Запись в консульство на подачу',
      description: '"Если вы планируете самостоятельную подачу документов на любую визовую программу – важно как можно раньше получить запись в консульстве страны вашего гражданства или резиденции. Срок ожидания очереди в большинстве локаций составляет от 4 до 6 месяцев.\n Для записи не требуется пакет документов как на подачу, важно лишь корректно заполнить предварительную анкету на сайте консульства, а также мониторить слот 24/7. Запись возможна, если консульство подключено к официальному визовому порталу Португалии.\n На данный момент, поддерживаются следующие города:\n📍 Москва | Анкара | Мадрид | Париж | Бангкок | Бухарест и другие',
      price: 100,
      selected: false,
      category: 'essential'
    },
     {
      id: '4',
      name: 'Check-Up документов',
      description: "✅ Проверка пакета документов на полноту и соответствие требованиям\n✅ Комментарии по каждому документу: что соответствует, что нужно доработать\n✅ Проверка переведённых и апостилированных документов\n✅ Проверка анкет, справок, договоров аренды, выписок и др.\n✅ Финальный чек-лист и рекомендации по доработке\n\nДля каких программ подойдёт:\n- D7 — виза по пассивному доходу\n- Digital Nomad Visa\n- D2 — виза предпринимателя (через стартап или ИП)\n- D3 — виза высококвалифицированного специалиста\n- ВНЖ по учёбе (школьник или студент профессиональных курсов)\n- Воссоединение семьи",
      price: 250,
      selected: false,
      category: 'essential'
    },
     {
      id: '5',
      name: 'Открыть ИП в Португалии',
      description: 'Регистрация на портале налоговой службы в качестве самозанятого или ИП с выбором соответствующей системы налогооблажения. Это позволяет легально вести бизнес или быть фрилансером в Португалии, а также запрашивать визу D2 или ВНЖ высококвалифицированного специалиста.',
      price: 160,
      selected: false,
      category: 'additional'
    },
    {
      id: '6',
      name: 'Формирование пакета документов для подачи в банк',
      description: 'Обширная проработка вашего кейса перед подачей документов в банк в любом городе Португалии. Включает в себя консультацию эксперта, предоставление шаблонов документов, машинный перевод документов, а также рекомендации по подаче и дополнительным запросам от комплайенса банка.',
      price: 450,
      selected: false,
      category: 'premium'
    },
    {
      id: '7',
      name: 'Консультация по открытию банковского счета в банке Caixa Geral',
      description: 'Счет в португальском банке требуется не только для подачи на ВНЖ, а также для удобства в бытовой жизни в стране, например, оплаты аренды, коммунальных платежей и для работы в качестве ИП. На консультации эксперт расскажет, какие документы и как нужно подготовить, в какие проверенные отделения обращаться – что наиболее важно для граждан РФ и РБ, но также актуально для граждан остальных стран.',
      price: 150,
      selected: false,
      category: 'premium'
    }
  ]);

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    promoCode: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'selection' | 'contact' | 'payment'>('selection');

  const discountRules: DiscountRule[] = [
    {
      type: 'bulk',
      value: 0.15,
      description: 'Скидка 15% при заказе всех услуг',
      condition: (services) => services.every(s => s.selected)
    },
    {
      type: 'promo',
      value: 0.10,
      description: 'Промокод на 10% скидку',
      condition: (services, formData) => formData?.promoCode.toUpperCase() === 'DIGITAL2024'
    },
    {
      type: 'first_time',
      value: 0.05,
      description: 'Скидка 5% для новых клиентов',
      condition: (services) => services.filter(s => s.selected).length >= 2
    }
  ];

  const toggleService = (id: string) => {
    setServices(prev => prev.map(service => 
      service.id === id ? { ...service, selected: !service.selected } : service
    ));
    
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const calculateTotal = () => {
    const selectedServices = services.filter(s => s.selected);
    const subtotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
    
    let totalDiscount = 0;
    const appliedDiscounts: string[] = [];

    discountRules.forEach(rule => {
      if (rule.condition && rule.condition(services, formData)) {
        totalDiscount = Math.max(totalDiscount, rule.value);
        appliedDiscounts.push(rule.description);
      }
    });

    const discountAmount = subtotal * totalDiscount;
    const total = subtotal - discountAmount;

    return {
      subtotal,
      discount: totalDiscount,
      discountAmount,
      total,
      appliedDiscounts,
      selectedServices
    };
  };

  const validateContactForm = () => {
    const validationRules = {
      name: { required: true, minLength: 2 },
      email: { required: true, email: true },
      phone: { required: true, phone: true }
    };

    const formDataAsRecord: Record<string, string> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      promoCode: formData.promoCode
    };

    const errors = validateForm(formDataAsRecord, validationRules);
    const errorMap: Record<string, string> = {};
    
    errors.forEach(error => {
      errorMap[error.field] = error.message;
    });

    setFormErrors(errorMap);
    return errors.length === 0;
  };

  const handleNextStep = () => {
    const calculation = calculateTotal();
    
    if (calculation.selectedServices.length === 0) {
      addToast('Выберите хотя бы одну услугу', 'warning');
      return;
    }

    if (currentStep === 'selection') {
      setCurrentStep('contact');
      setShowContactForm(true);
    } else if (currentStep === 'contact') {
      if (validateContactForm()) {
        setCurrentStep('payment');
        addToast('Данные успешно сохранены!', 'success');
      } else {
        addToast('Пожалуйста, исправьте ошибки в форме', 'error');
      }
    }
  };

  const handlePayment = async (method: string, amount: number) => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addToast(`Оплата успешно проведена через ${method}!`, 'success');
      
      setServices(prev => prev.map(s => ({ ...s, selected: false })));
      setFormData({ name: '', email: '', phone: '', promoCode: '' });
      setCurrentStep('selection');
      setShowContactForm(false);
      setTermsAccepted(false);
      
    } catch (error) {
      addToast('Ошибка при обработке платежа', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculation = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-thin text-gray-800 mb-2">
            Digital Nomad
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-4"></div>
          <p className="text-sm font-light text-gray-600">
            Программа получения визы цифрового кочевника в Португалии
          </p>
          
          <div className="flex justify-center mt-6 space-x-2">
            {['selection', 'contact', 'payment'].map((step, index) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentStep === step 
                    ? 'bg-blue-500 scale-125' 
                    : index < ['selection', 'contact', 'payment'].indexOf(currentStep)
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {currentStep === 'selection' && (
          <div className="space-y-3 mb-8">
            {services.map((service) => (
              <ServiceCard 
                key={service.id}
                service={service}
                onToggle={toggleService}
              />
            ))}
          </div>
        )}

        {currentStep === 'contact' && (
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-light text-gray-800 mb-4">Контактная информация</h2>
            
            <FormField
              label="Полное имя"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              error={formErrors.name}
              required
              placeholder="Введите ваше полное имя"
            />
            
            <FormField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
              error={formErrors.email}
              required
              placeholder="example@email.com"
            />
            
            <FormField
              label="Телефон"
              type="tel"
              value={formData.phone}
              onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
              error={formErrors.phone}
              required
              placeholder="+7 (999) 123-45-67"
            />
            
            <FormField
              label="Промокод"
              value={formData.promoCode}
              onChange={(value) => setFormData(prev => ({ ...prev, promoCode: value }))}
              placeholder="Введите промокод (необязательно)"
            />
          </div>
        )}

        {currentStep === 'payment' && (
          <div className="mb-8">
            <h2 className="text-xl font-light text-gray-800 mb-4">Способ оплаты</h2>
            <PaymentIntegration
              totalAmount={calculation.total}
              orderData={{
                services: calculation.selectedServices.map(s => ({ name: s.name, price: s.price })),
                discounts: calculation.appliedDiscounts.map(desc => ({ name: desc, amount: calculation.discountAmount })),
                contactInfo: {
                  firstName: formData.name,
                  lastName: '',
                  email: formData.email,
                  phone: formData.phone
                }
              }}
            />
          </div>
        )}

        {calculation.selectedServices.length > 0 && (
          <PriceSummary calculation={calculation} />
        )}

        <div className="space-y-4">
          {currentStep !== 'payment' && (
            <button
              onClick={handleNextStep}
              disabled={calculation.selectedServices.length === 0}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-light rounded-2xl 
                shadow-2xl shadow-blue-500/30 transition-all duration-300 active:scale-95 hover:-translate-y-0.5
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === 'selection' ? 'Продолжить' : 'К оплате'}
            </button>
          )}

          {currentStep === 'contact' && (
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-xs font-light text-gray-600 leading-relaxed">
                Я согласен с условиями предоставления услуг и политикой конфиденциальности
              </span>
            </label>
          )}

          {currentStep !== 'selection' && (
            <button
              onClick={() => setCurrentStep(prev => 
                prev === 'payment' ? 'contact' : 'selection'
              )}
              className="w-full py-3 text-gray-600 font-light rounded-2xl border border-gray-200 
                bg-white/80 backdrop-blur-xl hover:bg-gray-50 transition-all duration-300"
            >
              Назад
            </button>
          )}
        </div>
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

// Улучшенный Service Card Component с лучшим дропдауном
const ServiceCard: React.FC<{ service: Service; onToggle: (id: string) => void }> = ({ service, onToggle }) => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'essential': return 'border-red-200 shadow-red-200/20';
      case 'additional': return 'border-blue-200 shadow-blue-200/20';
      case 'premium': return 'border-purple-200 shadow-purple-200/20';
      default: return 'border-gray-200 shadow-gray-200/20';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'essential': return { text: 'Basic', color: 'bg-red-100 text-red-700' };
      case 'additional': return { text: 'Cтандарт', color: 'bg-blue-100 text-blue-700' };
      case 'premium': return { text: 'Pro', color: 'bg-purple-100 text-purple-700' };
      default: return { text: '', color: '' };
    }
  };

  const badge = getCategoryBadge(service.category);

  return (
    <div className={`bg-white/80 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl transition-all duration-300 hover:-translate-y-1 ${getCategoryColor(service.category)} ${service.selected ? 'ring-2 ring-blue-500/50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-light text-gray-800">{service.name}</h3>
            {badge.text && (
              <span className={`px-2 py-1 rounded-full text-xs font-light ${badge.color}`}>
                {badge.text}
              </span>
            )}
          </div>
          
          <button
            onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
            className="text-blue-600 text-sm font-light bg-blue-50 px-3 py-1.5 rounded-full 
              hover:bg-blue-100 transition-all duration-200 flex items-center space-x-2"
          >
            <span>Подробнее</span>
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-300 ${
                isDescriptionOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="font-light text-gray-800">{service.price}€</span>
          <label className="relative">
            <input
              type="checkbox"
              checked={service.selected}
              onChange={() => onToggle(service.id)}
              className="sr-only"
            />
            <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 cursor-pointer ${
              service.selected 
                ? 'bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/50 scale-110' 
                : 'border-gray-300 hover:border-blue-300'
            }`}>
              {service.selected && (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>
      
      <div className={`overflow-hidden transition-all duration-500 ease-out ${
        isDescriptionOpen ? 'max-h-96 opacity-100 mt-3 pt-3' : 'max-h-0 opacity-0'
      }`}>
        <div className="border-t border-gray-100 pt-3">
          <p className="text-sm font-light text-gray-600 leading-relaxed">
            {service.description}
          </p>
        </div>
      </div>
    </div>
  );
};

// Price Summary Component
const PriceSummary: React.FC<{ calculation: any }> = ({ calculation }) => {
  return (
    <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl shadow-blue-500/20 mb-8">
      <h3 className="font-light text-gray-800 mb-4">Сводка заказа</h3>
      
      <div className="space-y-2 mb-4">
        {calculation.selectedServices.map((service: Service) => (
          <div key={service.id} className="flex justify-between text-sm">
            <span className="font-light text-gray-600">{service.name}</span>
            <span className="text-gray-800">{service.price}€</span>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between">
          <span className="font-light text-gray-600">Подытог:</span>
          <span className="text-gray-800">{calculation.subtotal}€</span>
        </div>
        
        {calculation.discount > 0 && (
          <>
            <div className="flex justify-between text-green-600">
              <span className="font-light">Скидка ({Math.round(calculation.discount * 100)}%):</span>
              <span>-{calculation.discountAmount.toFixed(0)}€</span>
            </div>
            {calculation.appliedDiscounts.map((discount: string, index: number) => (
              <div key={index} className="text-xs text-green-600 font-light">
                • {discount}
              </div>
            ))}
          </>
        )}
        
        <div className="flex justify-between text-lg font-medium pt-2 border-t border-gray-200">
          <span>Итого:</span>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {calculation.total}€
          </span>
        </div>
      </div>
    </div>
  );
};

export default App;
