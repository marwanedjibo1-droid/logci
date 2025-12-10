# 📡 API Documentation - FacturePro

## Base URL

```
Development: http://localhost:5000/api
Production:  https://api.votre-domaine.com/api
```

## Authentication

Toutes les routes (sauf `/auth/login` et `/auth/register`) nécessitent un token JWT.

**Header:**
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication

### Register

```http
POST /auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "token": "jwt_token_here"
  }
}
```

### Login

```http
POST /auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "token": "jwt_token_here"
  }
}
```

### Get Current User

```http
GET /auth/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

---

## 👥 Clients

### Get All Clients

```http
GET /clients?search=terme&limit=100&offset=0
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "uuid",
      "name": "Société KONAN",
      "phone": "+225 07 08 09 10 11",
      "email": "contact@konan.ci",
      "address": "Abidjan, Plateau",
      "invoice_count": 5,
      "unpaid_amount": 150000,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Client

```http
GET /clients/:id
```

### Create Client

```http
POST /clients
```

**Body:**
```json
{
  "name": "Société KONAN",
  "phone": "+225 07 08 09 10 11",
  "email": "contact@konan.ci",
  "address": "Abidjan, Plateau",
  "notes": "Client VIP"
}
```

### Update Client

```http
PUT /clients/:id
```

### Delete Client

```http
DELETE /clients/:id
```

**Note:** Cannot delete clients with existing invoices

### Get Client Stats

```http
GET /clients/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_clients": 50,
    "new_this_month": 5,
    "clients_with_invoices": 45
  }
}
```

---

## 📄 Invoices

### Get All Invoices

```http
GET /invoices?status=paid&client_id=uuid&date_from=2025-01-01&date_to=2025-12-31&search=F-001&limit=100&offset=0
```

**Query Parameters:**
- `status`: paid, unpaid, pending, partial
- `client_id`: Filter by client
- `date_from`: Start date (YYYY-MM-DD)
- `date_to`: End date (YYYY-MM-DD)
- `search`: Search in invoice number or client name
- `limit`: Results per page (default: 100)
- `offset`: Pagination offset

**Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "id": "uuid",
      "number": "F-001234",
      "client_name": "Société KONAN",
      "date": "2025-01-15",
      "due_date": "2025-02-15",
      "subtotal": 100000,
      "tax_rate": 18,
      "tax_amount": 18000,
      "total": 118000,
      "paid_amount": 50000,
      "status": "partial",
      "items_count": 3,
      "payments_count": 1,
      "created_at": "2025-01-15T00:00:00.000Z"
    }
  ]
}
```

### Get Single Invoice

```http
GET /invoices/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "number": "F-001234",
    "client_id": "uuid",
    "client_name": "Société KONAN",
    "client_phone": "+225 07 08 09 10 11",
    "client_email": "contact@konan.ci",
    "date": "2025-01-15",
    "due_date": "2025-02-15",
    "subtotal": 100000,
    "tax_rate": 18,
    "tax_amount": 18000,
    "total": 118000,
    "paid_amount": 50000,
    "status": "partial",
    "notes": "Facture pour consultation",
    "items": [
      {
        "id": "uuid",
        "description": "Consultation informatique",
        "quantity": 2,
        "unit_price": 50000,
        "discount": 0,
        "total": 100000
      }
    ],
    "payments": [
      {
        "id": "uuid",
        "amount": 50000,
        "date": "2025-01-20",
        "method": "transfer",
        "notes": "Virement bancaire"
      }
    ],
    "created_at": "2025-01-15T00:00:00.000Z"
  }
}
```

### Create Invoice

```http
POST /invoices
```

**Body:**
```json
{
  "client_id": "uuid",
  "date": "2025-01-15",
  "due_date": "2025-02-15",
  "items": [
    {
      "description": "Consultation informatique",
      "quantity": 2,
      "unit_price": 50000,
      "discount": 0,
      "total": 100000
    }
  ],
  "subtotal": 100000,
  "tax_rate": 18,
  "tax_amount": 18000,
  "total": 118000,
  "notes": "Facture pour consultation",
  "status": "unpaid"
}
```

**Note:** `number` is auto-generated

### Update Invoice

```http
PUT /invoices/:id
```

### Delete Invoice

```http
DELETE /invoices/:id
```

### Get Invoice Stats

```http
GET /invoices/stats?period=month
```

**Query Parameters:**
- `period`: today, week, month, year

**Response:**
```json
{
  "success": true,
  "data": {
    "total_invoices": 150,
    "total_amount": 15000000,
    "paid_amount": 12000000,
    "unpaid_amount": 3000000,
    "paid_count": 120,
    "unpaid_count": 20,
    "pending_count": 5,
    "partial_count": 5,
    "overdue_count": 10
  }
}
```

### Get Next Invoice Number

```http
GET /invoices/next-number
```

**Response:**
```json
{
  "success": true,
  "data": {
    "number": "F-001235"
  }
}
```

---

## 💰 Payments

### Add Payment

```http
POST /payments
```

**Body:**
```json
{
  "invoice_id": "uuid",
  "amount": 50000,
  "date": "2025-01-20",
  "method": "transfer",
  "notes": "Virement bancaire"
}
```

**Methods:** cash, card, transfer, check, other

**Response:**
```json
{
  "success": true,
  "message": "Paiement ajouté avec succès",
  "data": {
    "id": "uuid",
    "invoice_id": "uuid",
    "amount": 50000,
    "date": "2025-01-20",
    "method": "transfer",
    "notes": "Virement bancaire",
    "created_at": "2025-01-20T00:00:00.000Z"
  }
}
```

### Get Payments by Invoice

```http
GET /payments/invoice/:invoiceId
```

---

## 📊 Reports

### Get Dashboard Stats

```http
GET /reports/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_invoices": 150,
    "total_sales": 15000000,
    "paid_amount": 12000000,
    "unpaid_amount": 3000000,
    "today_invoices": 5,
    "today_sales": 500000,
    "month_invoices": 50,
    "month_sales": 5000000
  }
}
```

### Get Sales Report

```http
GET /reports/sales?period=month&date_from=2025-01-01&date_to=2025-01-31
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-01-15",
      "invoice_count": 5,
      "total_sales": 500000,
      "paid_amount": 400000
    }
  ]
}
```

---

## ⚙️ Settings

### Get Settings

```http
GET /settings
```

**Response:**
```json
{
  "success": true,
  "data": {
    "company_name": "Mon Entreprise SARL",
    "phone": "+225 07 08 09 10 11",
    "email": "contact@entreprise.ci",
    "address": "Abidjan, Cocody",
    "logo": "base64_string_or_url",
    "invoice_prefix": "F-",
    "invoice_number": 1234,
    "currency": "FCFA",
    "tax_rate": 18,
    "language": "fr",
    "dark_mode": false
  }
}
```

### Update Settings

```http
PUT /settings
```

**Body:**
```json
{
  "company_name": "Mon Entreprise SARL",
  "phone": "+225 07 08 09 10 11",
  "tax_rate": 18,
  "currency": "FCFA"
}
```

---

## 📝 Activities

### Get Activities (Audit Log)

```http
GET /activities?limit=100
```

**Response:**
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "invoice_created",
      "description": "Facture F-001234 créée",
      "entity_type": "invoice",
      "entity_id": "uuid",
      "ip_address": "192.168.1.1",
      "metadata": {},
      "created_at": "2025-01-15T00:00:00.000Z"
    }
  ]
}
```

---

## 👤 Users (Admin Only)

### Get All Users

```http
GET /users
```

### Update User

```http
PUT /users/:id
```

### Delete User

```http
DELETE /users/:id
```

---

## 🔴 Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Erreur de validation",
  "errors": [
    {
      "field": "email",
      "message": "Email invalide"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Non autorisé - Token manquant"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Accès refusé - Rôle user non autorisé"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Client introuvable"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Erreur serveur interne"
}
```

---

## 🔄 Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 par IP
- **Response:** 429 Too Many Requests

---

## 📌 Notes

- Tous les timestamps sont en UTC (ISO 8601)
- Les montants sont en nombres décimaux
- Les IDs sont des UUIDs v4
- La pagination utilise limit/offset
- Les dates sont au format YYYY-MM-DD

---

**FacturePro API** - Version 1.0.0
