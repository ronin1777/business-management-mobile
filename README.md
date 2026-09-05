# 📱 Business Management Mobile

<p align="center">
  <strong>اپلیکیشن موبایل مدیریت کسب‌وکار و حسابداری</strong>
</p>

<p align="center">
  یک Mobile Client مدرن برای مدیریت عملیات، فروش، خرید، موجودی، مشتریان، تأمین‌کنندگان و تحلیل عملکرد کسب‌وکار
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.81-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-~54-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-111827?style=for-the-badge" alt="Platforms" />
</p>

<p align="center">
  <a href="#-معرفی">معرفی</a> •
  <a href="#-قابلیتها">قابلیت‌ها</a> •
  <a href="#-معماری">معماری</a> •
  <a href="#-تکنولوژیها">تکنولوژی‌ها</a> •
  <a href="#-راهاندازی">راه‌اندازی</a>
</p>

---

## 🧭 فهرست مطالب

* [معرفی](#-معرفی)
* [هدف پروژه](#-هدف-پروژه)
* [قابلیت‌ها](#-قابلیت‌ها)
* [داشبورد](#-داشبورد)
* [تحلیل و گزارش‌ها](#-تحلیل-و-گزارش‌ها)
* [احراز هویت](#-احراز-هویت)
* [معماری](#-معماری)
* [ساختار پروژه](#-ساختار-پروژه)
* [تکنولوژی‌ها](#-تکنولوژی‌ها)
* [طراحی رابط کاربری](#-طراحی-رابط-کاربری)
* [ارتباط با Backend](#-ارتباط-با-backend)
* [راه‌اندازی](#-راه‌اندازی)
* [وضعیت پروژه](#-وضعیت-پروژه)
* [Roadmap](#-roadmap)
* [توسعه‌دهنده](#-توسعه‌دهنده)

---

## 🎯 معرفی

**Business Management Mobile** یک اپلیکیشن موبایل برای مدیریت یکپارچه کسب‌وکار است که با تمرکز بر **مدیریت داده‌های عملیاتی و مالی** طراحی شده است.

اپلیکیشن از طریق REST API با Backend ارتباط برقرار می‌کند و بخش‌های مختلف کسب‌وکار را در یک رابط کاربری واحد در اختیار کاربر قرار می‌دهد.

تمرکز پروژه تنها روی ساخت چند صفحه موبایل نبوده؛ بلکه ساختار پروژه با در نظر گرفتن مواردی مانند:

* جداسازی مسئولیت‌ها
* Type Safety
* مدیریت Authentication
* مدیریت Token
* API Layer مرکزی
* مدیریت خطا
* Loading و Empty State
* Component Reusability
* Performance
* Responsive Mobile UI

طراحی شده است.

---

## 💡 هدف پروژه

هدف اصلی پروژه ایجاد یک تجربه موبایلی برای مدیریت کسب‌وکار است که کاربر بتواند بدون نیاز به دسترسی دائمی به نسخه دسکتاپ، اطلاعات مهم کسب‌وکار خود را مشاهده و مدیریت کند.

### حوزه‌های اصلی سیستم

```text
فروش
 ├── سفارش‌ها
 ├── مشتریان
 └── محصولات

خرید
 ├── خریدها
 ├── تأمین‌کنندگان
 └── مواد اولیه

موجودی
 ├── موجودی مواد اولیه
 ├── حداقل موجودی
 └── هشدار تأمین

تحلیل
 ├── فروش
 ├── خرید
 ├── سودآوری
 ├── موجودی
 ├── مشتریان
 └── تأمین‌کنندگان
```

---

# ✨ قابلیت‌ها

## 📊 Dashboard

داشبورد به‌عنوان نقطه ورود اصلی سیستم طراحی شده و مهم‌ترین شاخص‌های کسب‌وکار را در یک نمای خلاصه نمایش می‌دهد.

### شامل:

* فروش و سود
* محصولات پرفروش
* وضعیت موجودی
* سفارش‌های اخیر
* بینش‌های کسب‌وکار
* خلاصه مالی
* مشتریان
* تأمین‌کنندگان
* انتخاب بازه زمانی
* Loading State
* Error State
* Empty State

---

## 🧾 Orders

مدیریت سفارش‌ها با تمرکز روی نمایش سریع اطلاعات مهم:

* لیست سفارش‌ها
* وضعیت سفارش
* اطلاعات مشتری
* مبلغ سفارش
* فیلتر سفارش‌ها
* رابط کاربری مناسب موبایل
* مدیریت لیست‌های طولانی با `FlatList`

---

## 👥 Customers

مدیریت کامل مشتریان:

* مشاهده مشتریان
* ایجاد مشتری
* ویرایش مشتری
* مشاهده جزئیات
* مشاهده تراکنش‌ها
* نمایش مانده حساب
* وضعیت مالی مشتری

---

## 🏢 Suppliers

مدیریت تأمین‌کنندگان:

* لیست تأمین‌کنندگان
* ایجاد تأمین‌کننده
* ویرایش اطلاعات
* مشاهده جزئیات
* مشاهده تراکنش‌ها
* نمایش مانده حساب
* جستجو و فیلتر

---

## 📦 Inventory

سیستم مدیریت موجودی با تمرکز بر تشخیص سریع وضعیت اقلام.

### وضعیت‌های موجودی

| وضعیت            | مفهوم                        |
| ---------------- | ---------------------------- |
| 🟢 موجود         | موجودی در وضعیت مناسب        |
| 🟡 کم            | موجودی پایین‌تر از سطح مناسب |
| 🔴 ناموجود       | موجودی صفر                   |
| 🟠 نیازمند تأمین | نیاز به تهیه مجدد            |

### امکانات

* جستجوی مواد اولیه
* فیلتر وضعیت
* فیلتر واحد
* مرتب‌سازی بر اساس وضعیت
* تشخیص Low Stock
* تشخیص Out of Stock
* Supply Alert
* نمایش درصد موجودی نسبت به Minimum Stock
* خلاصه موجودی بر اساس واحد

---

## 🧂 Ingredients

* مشاهده مواد اولیه
* ایجاد ماده اولیه
* ویرایش
* مشاهده جزئیات
* موجودی فعلی
* حداقل موجودی
* واحد پایه
* وضعیت تأمین

---

## 🛒 Purchases

* مشاهده خریدها
* اطلاعات خرید
* ارتباط خرید با تأمین‌کننده
* ارتباط خرید با موجودی
* نمایش داده‌های خرید در موبایل

---

## 🧪 Products & Recipes

مدیریت محصولات و دستور ساخت:

* محصولات
* دستور ساخت
* مواد اولیه
* ارتباط Product و Ingredients
* اطلاعات موردنیاز برای تولید

---

# 📈 تحلیل و گزارش‌ها

یکی از بخش‌های اصلی اپلیکیشن، ماژول **Business Analytics** است.

گزارش‌ها در شش حوزه ارائه می‌شوند:

```text
Sales
Purchases
Profitability
Inventory
Customers
Suppliers
```

---

### 💰 Sales Analytics

* مجموع فروش
* میانگین فروش روزانه
* بهترین روز فروش
* روند فروش
* فروش روزانه
* محصولات پرفروش
* تحلیل بر اساس بازه زمانی

### 🛒 Purchase Analytics

* مجموع خرید
* روند خرید
* خرید روزانه
* مواد اولیه برتر
* تحلیل بازه زمانی

### 📊 Profitability Analytics

* سود
* حاشیه سود
* روند سودآوری
* محصولات سودآور

### 📦 Inventory Analytics

* وضعیت موجودی
* موجودی بر اساس واحد
* مواد اولیه کم‌موجود
* اقلام ناموجود
* اقلام نیازمند تأمین

### 👥 Customer Analytics

* تعداد مشتریان
* مشتریان برتر از نظر فروش
* مشتریان با بیشترین مانده

### 🏢 Supplier Analytics

* تعداد تأمین‌کنندگان
* تأمین‌کنندگان برتر از نظر خرید
* تأمین‌کنندگان با بیشترین مانده

---

# 🔐 احراز هویت

Authentication سیستم بر پایه **JWT** طراحی شده است.

```text
Login
  │
  ▼
Access Token + Refresh Token
  │
  ▼
Authenticated Requests
  │
  ├── 2xx → ادامه درخواست
  │
  └── 401
       │
       ▼
  Refresh Access Token
       │
       ├── موفق → Retry Request
       │
       └── شکست → Clear Session
```

### ویژگی‌ها

* Login
* Access Token
* Refresh Token
* Automatic Token Refresh
* Session Expiration Handling
* Logout
* Protected Routes
* Authentication Error Handling

همچنین API Client از یک مکانیزم مشترک برای Refresh Token استفاده می‌کند تا در صورت ارسال چند درخواست همزمان، Refresh Token چند بار به Backend ارسال نشود.

---

# 🏗️ معماری

ساختار پروژه بر اساس جداسازی مسئولیت‌ها طراحی شده است.

```text
┌──────────────────────────────┐
│            UI                │
│     Screens / Components     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        Context / Hooks       │
│      Application State       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         API Services         │
│   Domain-based API Modules   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Central API Client     │
│ Auth / Errors / Refresh      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         REST Backend         │
└──────────────────────────────┘
```

### اصول اصلی معماری

#### Separation of Concerns

UI، API، State و Typeها از یکدیگر جدا هستند.

#### Domain-Based Services

هر Domain سرویس API مخصوص خودش را دارد.

#### Centralized API Client

تمام درخواست‌ها از یک Client مرکزی عبور می‌کنند.

#### Type Safety

مدل‌های داده در یک Type Layer مستقل تعریف شده‌اند.

#### Reusable Components

کامپوننت‌های مشترک در مسیر `components` نگهداری می‌شوند.

---

# 📁 ساختار پروژه

```text
src/
│
├── app/
│   ├── index.tsx
│   ├── explore.tsx
│   ├── _layout.tsx
│   │
│   └── (dashboard)/
│       ├── index.tsx
│       ├── _layout.tsx
│       ├── customers/
│       ├── suppliers/
│       ├── ingredients/
│       ├── inventory/
│       ├── orders/
│       ├── products/
│       ├── purchases/
│       ├── recipes/
│       ├── reports/
│       └── settings/
│
├── components/
│   ├── dashboard/
│   ├── layout/
│   ├── orders/
│   └── reports/
│
├── constants/
│   └── theme.ts
│
├── context/
│   └── auth-context.tsx
│
├── hooks/
│
├── services/
│   └── api/
│       ├── auth.ts
│       ├── client.ts
│       ├── customers.ts
│       ├── dashboard.ts
│       ├── ingredients.ts
│       ├── inventory.ts
│       ├── orders.ts
│       ├── products.ts
│       ├── purchases.ts
│       ├── recipes.ts
│       ├── reports.ts
│       ├── suppliers.ts
│       ├── token-storage.ts
│       └── user.ts
│
├── types/
│
└── utils/
```

---

# 🧰 تکنولوژی‌ها

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/React%20Native-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo%20Router-000020?style=flat-square&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" />
</p>

| تکنولوژی                | نقش                           |
| ----------------------- | ----------------------------- |
| **TypeScript**          | زبان اصلی پروژه و Type Safety |
| **React Native**        | توسعه اپلیکیشن موبایل         |
| **Expo**                | Framework و Tooling           |
| **Expo Router**         | File-Based Routing            |
| **React Context**       | مدیریت Authentication State   |
| **Fetch API**           | ارتباط HTTP با Backend        |
| **JWT**                 | Authentication                |
| **StyleSheet**          | Native Styling                |
| **Lucide React Native** | Icon System                   |

---

# 🎨 طراحی رابط کاربری

Design System پروژه با الهام از اصول طراحی داشبوردهای مدرن مدیریتی شکل گرفته است.

### اصول طراحی

* Minimal
* Professional
* Mobile First
* RTL
* Persian UI
* Neutral Color Palette
* Semantic Colors
* Consistent Spacing
* Reusable Components
* Clear Visual Hierarchy

رنگ‌ها در بخش‌های مختلف UI عمدتاً خنثی هستند و از رنگ‌های Semantic برای نمایش وضعیت‌هایی مانند:

```text
Success
Warning
Error
Info
```

استفاده می‌شود.

---

# 📊 Sales Chart

نمودار فروش به‌صورت Native با `View`های React Native ساخته شده است.

### ویژگی‌ها

* فروش روزانه
* بازه ۱۴ روزه
* میانگین فروش
* بهترین روز
* Highlight بهترین روز
* Average Line
* Grid
* Date Labels
* Legend
* Empty State
* Responsive Layout

این تصمیم باعث شد بدون وابستگی غیرضروری به یک Chart Library، کنترل کامل‌تری روی Rendering و Design داشته باشیم.

---

# ⚡ Performance

Performance در طراحی بخش‌های مختلف پروژه در نظر گرفته شده است.

### موارد اصلی

* استفاده از `FlatList` برای لیست‌های طولانی
* تقسیم Screenهای بزرگ به Componentهای کوچک‌تر
* جلوگیری از قرار دادن منطق API داخل UI
* استفاده مجدد از Componentها
* مدیریت صحیح Loading State
* مدیریت Error State
* مدیریت Empty State
* استفاده از Native Components در بخش‌هایی که وابستگی خارجی ضروری نیست

---

# 🌐 Backend Integration

اپلیکیشن به یک REST API اختصاصی متصل است.

ساختار کلی ارتباط:

```text
Mobile App
     │
     ▼
API Client
     │
     ├── Authentication
     ├── Token Refresh
     ├── Error Handling
     └── Request Handling
     │
     ▼
REST API
     │
     ▼
Business Logic
     │
     ▼
Database
```

نمونه Domainهای API:

```text
/auth/
/orders/
/customers/
/suppliers/
/products/
/ingredients/
/inventory/
/purchases/
/recipes/
/reports/
```

---

# 🌍 RTL & Persian

اپلیکیشن برای کاربران فارسی‌زبان طراحی شده و رابط کاربری آن به‌صورت RTL پیاده‌سازی شده است.

RTL در بخش‌هایی مانند:

* Navigation
* Layout
* Forms
* Lists
* Cards
* Filters
* Reports
* Financial Data

در نظر گرفته شده است.

---

# 🚀 راه‌اندازی

## پیش‌نیازها

قبل از شروع مطمئن شوید موارد زیر نصب هستند:

* Node.js
* npm
* Expo
* Expo Go

یا یکی از محیط‌های زیر:

* Android Emulator
* iOS Simulator
* Development Build

---

## 1. Clone

```bash
git clone https://github.com/ronin1777/business-management-mobile.git
```

```bash
cd business-management-mobile
```

---

## 2. نصب Dependencies

```bash
npm install
```

---

## 3. اجرای پروژه

```bash
npx expo start
```

پس از اجرای Expo می‌توانید پروژه را با:

```text
Expo Go
Android Emulator
iOS Simulator
Development Build
```

اجرا کنید.

---

# 🔧 Backend Configuration

اپلیکیشن برای عملکرد کامل به Backend نیاز دارد.

آدرس API باید در API Client پروژه مطابق محیط توسعه تنظیم شود.

نمونه:

```text
http://YOUR-BACKEND-HOST:8000/api
```

> اگر از موبایل واقعی برای تست استفاده می‌کنید، `localhost` به کامپیوتر شما اشاره نمی‌کند. باید از IP سیستم در شبکه محلی استفاده شود.

---

# 🧪 Development

پروژه با ساختار قابل توسعه طراحی شده و اضافه کردن Domainهای جدید باید تا حد امکان از الگوی موجود پیروی کند.

برای مثال یک Feature جدید می‌تواند شامل:

```text
app/
components/
services/api/
types/
```

باشد.

به این ترتیب UI، API و Data Models از یکدیگر جدا باقی می‌مانند.

---

# 🗺️ وضعیت پروژه

### Core

* [x] Project Setup
* [x] Expo Router
* [x] TypeScript
* [x] RTL
* [x] Authentication
* [x] JWT Token Management
* [x] API Client
* [x] Error Handling

### Business

* [x] Dashboard
* [x] Orders
* [x] Customers
* [x] Suppliers
* [x] Products
* [x] Ingredients
* [x] Inventory
* [x] Purchases
* [x] Recipes

### Analytics

* [x] Sales Reports
* [x] Purchase Reports
* [x] Profitability Reports
* [x] Inventory Reports
* [x] Customer Reports
* [x] Supplier Reports

### UX

* [x] Loading States
* [x] Error States
* [x] Empty States
* [x] Responsive Layout
* [x] Mobile-first UI
* [x] Persian UI
* [x] RTL

---

# 🔮 Roadmap

قابلیت‌های زیر می‌توانند در نسخه‌های آینده اضافه شوند:

* [ ] Push Notifications
* [ ] Offline Mode
* [ ] Data Synchronization
* [ ] Infinite Scrolling
* [ ] Advanced Search
* [ ] Advanced Filters
* [ ] Report Export
* [ ] Dark Mode
* [ ] Biometric Authentication
* [ ] Business Alerts
* [ ] Advanced Financial Analytics

---

# 🔗 Related Project

این Repository مربوط به **Mobile Client** سیستم Business Management است.

معماری سیستم به‌صورت Client / API طراحی شده است:

```text
┌───────────────────────┐
│   Business Management │
│      Mobile App       │
│                       │
│ React Native + Expo   │
└───────────┬───────────┘
            │
            │ REST API
            ▼
┌───────────────────────┐
│       Backend         │
│                       │
│ Django REST Framework │
└───────────────────────┘
```

---

# 👨‍💻 توسعه‌دهنده

**Hossein Sayah**

Full-Stack Developer

### حوزه‌های تخصصی

```text
Backend
├── Python
├── Django
└── Django REST Framework

Frontend
├── React
├── Next.js
└── TypeScript

Mobile
└── React Native
```

---

## ⭐ اگر پروژه برایتان مفید بود

اگر این پروژه برایتان جالب بود، می‌توانید Repository را ⭐ Star کنید.

---

## 📄 License

این پروژه یک پروژه شخصی و Portfolio است.
