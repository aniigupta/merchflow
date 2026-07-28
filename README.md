# MerchFlow: Custom Merchandise E-commerce & Order Management Platform

A premium, full-stack web application designed for a custom merchandise business. Customers can browse products, configure printing options (size, color, print type, location, and upload graphic designs), checkout with mock payments, and track their order status. Administrators can configure products and categories, view analytics dashboard aggregates, and advance orders through a sequential lifecycle.

---

## 📁 Repository Structure

```text
/
├── server/             # Express.js + Mongoose Backend
│   ├── src/
│   │   ├── config/     # Database connections and constants configurations
│   │   ├── controllers/# Auth, Product, Cart, Order, Payment, Shipping & Admin Controllers
│   │   ├── middleware/ # Authentication locks, Validator helpers & Global Error Handler
│   │   ├── models/     # Mongoose Schemas (User, Product, Cart, Order, Payment, Shipping)
│   │   ├── routes/     # Express API Routing definitions
│   │   ├── scripts/    # Seeding scripts & workflow transition tests
│   │   └── utils/      # Helpers and operational AppError handlers
│   ├── uploads/        # Local directory storing customized user design uploads
│   ├── .env.example    # Backend environment template
│   └── package.json    # Backend dependencies
│
├── client/             # React + Vite Frontend
│   ├── src/
│   │   ├── components/ # Shared, reusable layout elements (ProtectedRoute, ErrorBoundary)
│   │   ├── context/    # Global AuthContext API provider
│   │   ├── pages/      # Views (Catalog, Details, Cart, Checkout, Payments, Orders, Dashboard, Tracking)
│   │   ├── services/   # Axios client config with request/response interceptors
│   │   ├── App.jsx     # Route definitions, catch-all 404, and ErrorBoundary wrappers
│   │   └── index.css   # Tailored HSL CSS foundations
│   ├── .env.example    # Frontend environment template
│   └── package.json    # Client dependencies
│
└── README.md           # Getting started and API documentation manual
```

---

## 🛠️ Tech Stack

- **Frontend**: React.js (v19), React Router (v7), Tailwind CSS (v3), Lucide Icons, Axios.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT Authentication, Multer (Local Uploads), Express Validator.
- **Testing**: Native scripting controllers validating constraints synchronously.

---

## ⚡ Quick Start Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally, or a remote MongoDB Atlas connection string)

### 1. Database Seeding Setup
Before starting, ensure MongoDB is active on your local machine:
```bash
# Windows (PowerShell/CMD if service is not auto-started)
net start MongoDB
```

### 2. Backend Setup
1. Navigate to `/server`:
   ```bash
   cd server
   ```
2. Copy the environment template to create a active `.env` file:
   ```bash
   copy .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the seed script to populate products, categories, and test accounts:
   ```bash
   npm run seed
   ```
5. Fire up the development API server:
   ```bash
   npm run dev
   ```
   The backend API will boot on **`http://localhost:5000`**.

---

### 3. Frontend Setup
1. Open a new terminal instance and navigate to `/client`:
   ```bash
   cd client
   ```
2. Copy the client environment template:
   ```bash
   copy .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Launch the local Vite development server:
   ```bash
   npm run dev
   ```
   The client application will boot on **`http://localhost:5173`**.

---

## 🔑 Demo Account Credentials

Use the following seeded accounts to verify platform features:

### 👤 Customer Account
- **Email**: `customer@merchflow.com`
- **Password**: `CustomerPassword123!`
- **Capabilities**: Browse catalog, configure customized products, add items to cart, checkout, complete mock card payments, track order progress, and cancel orders before production.

### 👑 Admin Account
- **Email**: `admin@merchflow.com`
- **Password**: `AdminPassword123!`
- **Capabilities**: Manage products & categories, access aggregate sales dashboards, assign logistics courier tracking numbers, and advance orders sequentially.

---

## 📝 API Endpoints Catalog

All API endpoints are prefixed with `/api`. Authenticated routes expect an `Authorization: Bearer <JWT_TOKEN>` header.

### 1. Authentication Module (`/auth`)

| Method | Path | Auth Required | Description | Sample Request | Sample Response (Success) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | No | Register new user | `{ "name": "Test", "email": "t@t.com", "password": "Pass123!" }` | `{ "success": true, "token": "jwt...", "user": { "role": "customer" } }` |
| **POST** | `/auth/login` | No | Authenticate credentials | `{ "email": "customer@merchflow.com", "password": "CustomerPassword123!" }` | `{ "success": true, "token": "jwt...", "user": { "role": "customer" } }` |
| **GET** | `/auth/me` | Yes (Any) | Retrieve current user profile | *Empty* | `{ "success": true, "data": { "email": "customer@merchflow.com", "role": "customer" } }` |

### 2. Products & Categories Module (`/products`, `/categories`)

| Method | Path | Auth Required | Description | Sample Query/Body | Sample Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/products` | No | List products with pagination/filters | `?category=catId&printType=Screen Printing` | `{ "success": true, "products": [...], "pagination": { "totalPages": 1 } }` |
| **GET** | `/products/:id` | No | Fetch product details | *Empty* | `{ "success": true, "data": { "name": "Classic T-Shirt", "price": 599 } }` |
| **POST** | `/products` | Yes (Admin) | Create product (supports multipart/form-data) | FormData matching product validations | `{ "success": true, "data": { "sku": "TSH-01", "name": "New Tee" } }` |
| **GET** | `/categories` | No | List categories | *Empty* | `{ "success": true, "data": [{ "name": "T-Shirts" }] }` |

### 3. Shopping Cart Module (`/cart`)

| Method | Path | Auth Required | Description | Sample Request | Sample Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/cart` | Yes (Customer) | Retrieve cart items & subtotals | *Empty* | `{ "success": true, "data": { "items": [...], "subtotal": 599, "total": 785 } }` |
| **POST** | `/cart` | Yes (Customer) | Add customized item to cart | `{ "productId": "id", "size": "L", "color": { "name": "Black" }, "quantity": 1, "printLocation": "front", "designImage": "url" }` | `{ "success": true, "data": { "items": [...] } }` |
| **PUT** | `/cart/:itemId` | Yes (Customer) | Update item quantity | `{ "quantity": 3 }` | `{ "success": true, "data": { "items": [...] } }` |
| **DELETE**| `/cart/:itemId` | Yes (Customer) | Remove item from cart | *Empty* | `{ "success": true, "data": { "items": [...] } }` |

### 4. Order Module (`/orders`)

| Method | Path | Auth Required | Description | Sample Request | Sample Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/orders` | Yes (Customer) | Place order from cart | `{ "shippingAddress": { "fullName": "J", "phone": "12", "line1": "L1", "city": "C", "state": "S", "postalCode": "1" } }` | `{ "success": true, "data": { "_id": "orderId", "status": "Order Placed" } }` |
| **GET** | `/orders/:id` | Yes (Any) | View single order details | *Empty* | `{ "success": true, "data": { "status": "Order Placed", "items": [...] } }` |
| **PATCH** | `/orders/:id/status`| Yes (Admin) | Enforce status workflow progression | `{ "status": "Payment Verified" }` | `{ "success": true, "data": { "status": "Payment Verified" } }` |
| **PATCH** | `/orders/:id/cancel`| Yes (Customer/Admin)| Cancel order | `{ "cancelReason": "Changed mind" }` | `{ "success": true, "data": { "status": "Cancelled" } }` |

### 5. Payment Module (`/payments`)

| Method | Path | Auth Required | Description | Sample Request | Sample Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/payments/create` | Yes (Customer) | Initialize mock payment intent | `{ "orderId": "orderId" }` | `{ "success": true, "data": { "paymentId": "pay_123", "amount": 785 } }` |
| **POST** | `/payments/verify` | Yes (Customer) | Verify mock payment outcome | `{ "paymentId": "pay_123", "status": "Successful" }` | `{ "success": true, "data": { "paymentStatus": "Successful", "orderStatus": "Payment Verified" } }` |

### 6. Shipping Module (`/shipping`)

| Method | Path | Auth Required | Description | Sample Request | Sample Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/shipping/create` | Yes (Admin) | Assign shipment parameters (only for Packed orders) | `{ "orderId": "orderId" }` | `{ "success": true, "data": { "trackingNumber": "TRK123", "courierName": "Delhivery" } }` |
| **GET** | `/shipping/track/:trackingNumber` | No | Public tracking lookup | *Empty (Path param)* | `{ "success": true, "data": { "trackingNumber": "TRK123", "shippingStatus": "Shipment Created" } }` |

### 7. Administrative Analytics Dashboard (`/admin`)

| Method | Path | Auth Required | Description | Sample Request | Sample Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/admin/dashboard` | Yes (Admin) | Aggregate totals, revenue summaries and low stock alerts | *Empty* | `{ "success": true, "data": { "metrics": { "totalRevenue": 2300, "totalOrders": 1 }, "lowStockProducts": [...] } }` |
