# نظام متابعة الأدوية المتقدم

## وصف المشروع
نظام متكامل لمتابعة الأدوية والجرعات مع إشعارات ذكية وFirebase Authentication.

## الميزات
- نظام تسجيل دخول باستخدام Firebase Authentication
- إضافة وإدارة الأدوية
- جدولة الجرعات تلقائياً
- إشعارات Push
- نظام ترجمة (عربي/إنجليزي)
- واجهة مستخدم متجاوبة

## التثبيت والتنصيب

### 1. متطلبات النظام
- Node.js (لـ Firebase CLI)
- حساب Firebase

### 2. خطوات التنصيب

#### أ. إعداد Firebase
1. سجّل الدخول إلى [Firebase Console](https://console.firebase.google.com/)
2. أنشئ مشروع جديد أو اختر مشروعك الحالي
3. اذهب إلى Authentication → Sign-in method
4. فعّل "Email/Password"

#### ب. تهيئة قاعدة البيانات
1. اذهب إلى Realtime Database
2. اضغط على "Create Database"
3. اختر "Start in test mode"
4. عدّل القواعد لتكون:
   ```json
   {
     "rules": {
       ".read": "auth != null",
       ".write": "auth != null"
     }
   }
