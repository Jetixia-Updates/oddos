# دليل ربط الموقع الإلكتروني بوحدة E-Commerce

## نظرة عامة
تم إضافة تاب **Website** في وحدة E-Commerce لربط وإدارة الموقع الإلكتروني الخاص بك مع النظام.

## الميزات المتوفرة

### 1. إعدادات المتجر الأساسية
- **اسم المتجر**: اسم المتجر الإلكتروني
- **رابط المتجر**: URL الخاص بالموقع
- **وصف المتجر**: وصف مختصر عن المتجر
- **العملة**: اختيار عملة المتجر (USD, EUR, SAR, AED, GBP)
- **اللغة**: اختيار لغة الموقع (English, العربية, Français, Español)
- **الألوان**: تخصيص الألوان الأساسية والثانوية

### 2. إعدادات SEO
- **Meta Title**: عنوان الصفحة لمحركات البحث
- **Meta Description**: وصف الموقع لمحركات البحث
- **Keywords**: الكلمات المفتاحية (قيد التطوير)

### 3. إعدادات الشحن
- **حد الشحن المجاني**: القيمة التي عندها يصبح الشحن مجانياً
- **تكلفة الشحن العادي**: سعر الشحن القياسي
- **تكلفة الشحن السريع**: سعر الشحن السريع

### 4. روابط التواصل الاجتماعي
- Facebook
- Instagram
- Twitter
- LinkedIn

### 5. وضع التشغيل المباشر (Live Mode)
- **Test Mode**: الموقع في وضع الاختبار (لا يقبل طلبات حقيقية)
- **Live Mode**: الموقع مفعل ويقبل طلبات حقيقية

### 6. API Integration
#### توليد API Key
1. اذهب إلى تاب **Website**
2. في قسم "API Integration"
3. اضغط على **Generate New Key**
4. سيتم إنشاء مفتاح API فريد بالشكل: `sk_live_xxxxxxxxxxxxxxxxxxxxx`

#### استخدام API Key
```javascript
// Example: Initialize E-Commerce SDK
const store = new ECommerce({
  apiKey: "sk_live_your_generated_key",
  storeUrl: "https://yourstore.com"
});

// Fetch products
const products = await store.getProducts();

// Create order
const order = await store.createOrder({
  customer: "John Doe",
  items: [
    { productId: "123", quantity: 2 }
  ]
});
```

### 7. Webhook URL
قم بإضافة رابط الـ Webhook لاستقبال إشعارات عن:
- طلبات جديدة
- تحديثات حالة الطلبات
- مدفوعات جديدة
- تقييمات جديدة

#### مثال Webhook Handler
```javascript
// Express.js example
app.post('/webhook', (req, res) => {
  const event = req.body;
  
  switch(event.type) {
    case 'order.created':
      console.log('New order:', event.data);
      break;
    case 'order.updated':
      console.log('Order updated:', event.data);
      break;
    case 'payment.completed':
      console.log('Payment completed:', event.data);
      break;
  }
  
  res.json({ received: true });
});
```

### 8. روابط سريعة (Quick Links)
- **زيارة المتجر**: فتح الموقع الإلكتروني في تاب جديد
- **نسخ رابط المتجر**: نسخ URL للحافظة
- **نسخ API Key**: نسخ مفتاح API للحافظة

## API Endpoints الجديدة

### GET /api/ecommerce/website-settings
جلب إعدادات الموقع الإلكتروني

**Response:**
```json
{
  "_id": "...",
  "storeName": "My Store",
  "storeUrl": "https://mystore.com",
  "storeDescription": "Best products online",
  "currency": "USD",
  "language": "en",
  "primaryColor": "#6366f1",
  "secondaryColor": "#ec4899",
  "enableLiveMode": true,
  "apiKey": "sk_live_...",
  "webhookUrl": "https://mystore.com/webhook",
  "socialMedia": {
    "facebook": "https://facebook.com/mystore",
    "instagram": "https://instagram.com/mystore"
  },
  "seo": {
    "metaTitle": "My Store - Best Products",
    "metaDescription": "Shop the best products..."
  },
  "shipping": {
    "freeShippingThreshold": 100,
    "standardShippingCost": 5.99,
    "expressShippingCost": 15.99
  }
}
```

### POST /api/ecommerce/website-settings
حفظ أو تحديث إعدادات الموقع

**Request Body:**
```json
{
  "storeName": "My Store",
  "storeUrl": "https://mystore.com",
  "enableLiveMode": true,
  ...
}
```

**Response:**
```json
{
  "success": true,
  "...": "saved settings"
}
```

## خطوات الربط مع موقعك

### الخطوة 1: تثبيت SDK (قريباً)
```bash
npm install @yourstore/ecommerce-sdk
```

### الخطوة 2: إعداد الموقع
1. افتح وحدة E-Commerce
2. اذهب إلى تاب **Website**
3. املأ معلومات المتجر الأساسية
4. قم بتوليد API Key
5. أدخل Webhook URL (اختياري)
6. احفظ الإعدادات

### الخطوة 3: التفعيل
1. فعّل وضع **Live Mode** عندما تكون جاهزاً
2. انسخ API Key
3. استخدمه في موقعك الإلكتروني

## الأمان

⚠️ **مهم جداً:**
- احتفظ بـ API Key في مكان آمن
- لا تشارك المفتاح علناً
- استخدم HTTPS في جميع الطلبات
- في حالة تسريب المفتاح، قم بإعادة توليد مفتاح جديد فوراً

## الدعم الفني

في حالة وجود أي مشاكل أو استفسارات حول ربط الموقع:
1. تأكد من صحة API Key
2. تحقق من تفعيل Live Mode
3. راجع console للأخطاء
4. تأكد من وجود اتصال بالإنترنت

---

تم التطوير بواسطة فريق Odoo ERP System ✨
