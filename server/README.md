# Alpha Admin Backend (Node + Express + MongoDB)

REST API for product posting and management supporting diverse product types via flexible attributes.

## Features

- CRUD for products at ` /api/products `
- Filtering, text search, pagination, and sorting
- Flexible `attributes` field to support different product categories
- Built with Express and Mongoose (no TypeScript)
- CORS enabled, JSON body parsing, error handling middleware

## Endpoints

- POST `/api/products` — create product
- GET `/api/products` — list products
  - Query params: `page`, `limit`, `sortBy`, `order` (asc|desc), `q` (text search), `type`, `inStock` (true|false), `brand`, `tags` (comma-separated), `minPrice`, `maxPrice`
- GET `/api/products/:id` — get a product
- PUT `/api/products/:id` — update a product
- DELETE `/api/products/:id` — delete a product
- GET `/api/health` — health check

## Product Schema (example)

```json
{
  "name": "iPhone 15",
  "description": "128GB, Midnight",
  "type": "phone",
  "price": 999,
  "currency": "USD",
  "images": ["https://..."],
  "attributes": {"storage": "128GB", "color": "Midnight"},
  "inStock": true,
  "stockCount": 12,
  "brand": "Apple",
  "tags": ["smartphone", "ios"]
}
```

## Setup

1. Copy environment file and edit values

```bash
cp .env.example .env
# Set MONGO_URI and PORT if needed
```

2. Install dependencies and run

```bash
npm install
npm run dev
# Server: http://localhost:5000
```

3. Example requests

- Create a product

```bash
curl -X POST http://localhost:5000/api/products \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "T-Shirt",
    "description": "100% cotton",
    "type": "apparel",
    "price": 19.99,
    "attributes": {"size": "M", "color": "Black"},
    "brand": "Alpha",
    "tags": ["clothing", "men"]
  }'
```

- List with filters and search

```bash
curl 'http://localhost:5000/api/products?q=shirt&minPrice=10&maxPrice=50&tags=clothing,men&sortBy=price&order=asc&page=1&limit=10'
```

## Notes

- Ensure MongoDB is running and `MONGO_URI` is correct (e.g., `mongodb://localhost:27017/alpha_admin`).
- Adjust CORS or add `origin` if you need to restrict to your frontend domain.
