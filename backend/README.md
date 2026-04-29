# VMS Backend

NestJS backend for the VMS client application.

## Run locally

```bash
cd backend
npm install
npm run start:dev
```

The API will run on `http://localhost:3001/api`.

## Endpoints

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/slug/:slug`
- `GET /api/products/category/:category`
- `POST /api/products`
- `GET /api/categories`
- `POST /api/auth/admin/login`
- `POST /api/orders/checkout`
- `GET /api/orders`
- `GET /api/orders/:id`
