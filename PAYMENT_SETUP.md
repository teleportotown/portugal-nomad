# Настройка платежных систем

## Обзор

Проект поддерживает три платежные системы для разных валют:
- **Stripe** - для оплаты в евро банковскими картами
- **RoboKassa** - для оплаты российскими рублями (СБП, карты РФ)
- **NOWPayments** - для оплаты криптовалютами (300+ криптовалют)

---

## 1. Stripe (Евро)

### Регистрация:
1. Перейдите на https://dashboard.stripe.com/register
2. Заполните форму регистрации
3. Подтвердите email
4. Пройдите процедуру верификации бизнеса

### Получение API ключей:
1. Войдите в Dashboard
2. Перейдите в "Developers" → "API keys"
3. Скопируйте:
   - **Publishable key** (начинается с `pk_`)
   - **Secret key** (начинается с `sk_`)

### Настройка в проекте:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_ваш_publishable_key
VITE_STRIPE_SECRET_KEY=sk_test_ваш_secret_key
VITE_STRIPE_TEST_MODE=true
```

### Тестовые карты Stripe:
- **Успешная оплата**: 4242 4242 4242 4242
- **Отклоненная карта**: 4000 0000 0000 0002
- **Недостаточно средств**: 4000 0000 0000 9995

---

## 2. RoboKassa (Российские рубли)

### Получение API ключей:
1. Войдите в личный кабинет RoboKassa
2. Перейдите в "Настройки" → "Технические настройки"
3. Найдите раздел "Пароли для формирования контрольной суммы"
4. Скопируйте:
   - **Идентификатор магазина** (MerchantLogin)
   - **Пароль #1** (для формирования подписи)
   - **Пароль #2** (для проверки уведомлений)

### Настройка в проекте:
```env
VITE_ROBOKASSA_MERCHANT_LOGIN=ваш_логин_магазина
VITE_ROBOKASSA_PASSWORD1=ваш_пароль_1
VITE_ROBOKASSA_PASSWORD2=ваш_пароль_2
VITE_ROBOKASSA_TEST_MODE=true
```

### Поддерживаемые способы оплаты:
- Система быстрых платежей (СБП)
- Банковские карты российских банков
- Электронные кошельки (QIWI, ЮMoney и др.)

---

## 3. NOWPayments (Криптовалюты)

### Регистрация:
1. Перейдите на https://nowpayments.io
2. Создайте аккаунт
3. Подтвердите email
4. Пройдите процедуру верификации (KYC)
5. Настройте кошельки для получения средств

### Получение API ключей:
1. Войдите в Dashboard NOWPayments
2. Перейдите в "Settings" → "API keys"
3. Создайте новый API ключ
4. **Важно**: Сохраните ключ - он показывается только один раз!
5. Скопируйте **оба ключа**:
   - **API Key** (для создания платежей) - например: `9JJ5...XB3D`
   - **Public Key** (для публичных операций) - например: `0f1c...6a1a`

### Настройка в проекте:
```env
VITE_NOWPAYMENTS_API_KEY=ваш_полный_api_ключ_здесь
VITE_NOWPAYMENTS_PUBLIC_KEY=ваш_полный_public_ключ_здесь
VITE_NOWPAYMENTS_TEST_MODE=true
```

### Типы ключей NOWPayments:
- **API Key** - используется для создания платежей и приватных операций
- **Public Key** - используется для получения валют, статуса API и других публичных данных

### Важные особенности NOWPayments:
- **Sandbox режим**: Для тестирования используйте `api-sandbox.nowpayments.io`
- **Production режим**: Для реальных платежей `api.nowpayments.io`
- **API ключ**: Должен быть полным, без сокращений
- **Валюты**: Все коды валют в нижнем регистре (btc, eth, usdt)
- **Минимальные суммы**: У каждой криптовалюты есть минимальная сумма

### Поддерживаемые криптовалюты:
- **Bitcoin (BTC)** - основная криптовалюта
- **Ethereum (ETH)** - вторая по популярности
- **USDT** - стабильная монета
- **300+ других криптовалют** - полный список на сайте NOWPayments

### Процесс оплаты:
1. Клиент выбирает криптовалюту
2. Система создает платеж через API
3. Генерируется адрес кошелька для оплаты
4. Клиент переводит средства на этот адрес
5. NOWPayments отслеживает транзакцию
6. После подтверждения средства поступают в ваш кошелек

### Особенности:
- Комиссия всего 0.5%
- Некастодиальные платежи (средства идут прямо в ваш кошелек)
- Автоматическая конвертация между криптовалютами
- Быстрые переводы (обычно менее 5 минут)
- Поддержка IPN (Instant Payment Notifications)

---

## 4. Настройка проекта

### Создание .env файла:
1. Скопируйте `env.example` в `.env`
2. Заполните реальными значениями API ключей
3. Убедитесь, что `.env` добавлен в `.gitignore`

### Полный пример .env:
```env
# Stripe (Евро)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_TEST_MODE=true

# RoboKassa (Рубли)
VITE_ROBOKASSA_MERCHANT_LOGIN=ваш_логин
VITE_ROBOKASSA_PASSWORD1=пароль_1
VITE_ROBOKASSA_PASSWORD2=пароль_2
VITE_ROBOKASSA_TEST_MODE=true

# NOWPayments (Криптовалюты)
VITE_NOWPAYMENTS_API_KEY=ваш_полный_api_ключ_здесь
VITE_NOWPAYMENTS_PUBLIC_KEY=ваш_полный_public_ключ_здесь
VITE_NOWPAYMENTS_TEST_MODE=true
```

### Курсы валют:
В файле `src/config/payment.ts` настройте актуальные курсы:
```typescript
exchangeRates: {
  eurToRub: 100,      // 1 EUR = 100 RUB
  eurToBtc: 0.000015, // 1 EUR = 0.000015 BTC
  eurToEth: 0.0003,   // 1 EUR = 0.0003 ETH
  eurToUsdt: 1.05     // 1 EUR = 1.05 USDT
}
```

---

## 5. Безопасность

### Важные моменты:
- **Никогда не коммитьте .env файл**
- Secret ключи должны быть только на сервере
- Используйте HTTPS в production
- Регулярно обновляйте API ключи
- Настройте webhook'и для обработки уведомлений

### Webhook URL'ы:
- **Stripe**: `https://yourdomain.com/api/stripe/webhook`
- **RoboKassa**: `https://yourdomain.com/api/robokassa/callback`
- **NOWPayments**: `https://yourdomain.com/api/nowpayments/callback`

---

## 6. Тестирование

### Команды для запуска:
```bash
# Установка зависимостей
bun install

# Запуск в dev режиме
bun run dev

# Сборка для production
bun run build
```

### Тестовые режимы:
- **Stripe**: используйте тестовые ключи и тестовые карты
- **RoboKassa**: включите тестовый режим в настройках
- **NOWPayments**: используйте sandbox API для тестирования

---

## 7. Production

### Переход в production:
1. Получите production ключи от всех сервисов
2. Обновите .env файл:
   ```env
   VITE_STRIPE_TEST_MODE=false
   VITE_ROBOKASSA_TEST_MODE=false
   VITE_NOWPAYMENTS_TEST_MODE=false
   ```
3. Настройте webhook'и на production URL'ы
4. Проведите тестовые платежи

### Мониторинг:
- Отслеживайте транзакции в Dashboard каждого сервиса
- Настройте уведомления об ошибках
- Регулярно проверяйте работоспособность платежей