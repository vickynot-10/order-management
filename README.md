# Order Management — Food Delivery App

Live demo: https://order-management-gamma-black.vercel.app/admin  
Repo: https://github.com/vickynot-10/order-management  
Video walkthrough: https://drive.google.com/file/d/1eB7MnPyr5d0e2AEvatoBwsjNatN-xb-a/view?usp=drivesdk

## Tech Stack
- Next.js (App Router)
- MongoDB
- Zod (validation)
- Jest + React Testing Library
- Server-Sent Events (real-time order status)

## Features
- Menu display with add-to-cart
- Cart with quantity controls, persisted to localStorage
- Checkout with delivery details + validation
- Order placement via REST API
- Real-time order status updates (SSE)
- Auth (sign up / sign in / admin login)
- Admin: view + update order status

## Environment Variables

Create a `.env.local` file in the project root with the following:

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017
MONGO_DB=ordermanagement
JWT_SECRET_KEY=your_jwt_secret_key_here
```

A reference copy is included as `.env.example` in the repo root — copy it to `.env.local` and fill in your own values.

## Running Locally
```bash
npm install
cp .env.example .env.local   # then fill in your own MongoDB URI and JWT secret
npm run dev
```

## Running Tests
```bash
npm run test
```
77 tests covering API routes (CRUD, validation, auth, error handling) and key UI components (cart, checkout, order status, real-time stream).

## API Endpoints
| Method | Route | Description |
|---|---|---|
| POST | /api/sign-up | Register user |
| POST | /api/sign-in | Login |
| POST | /api/sign-out | Logout |
| GET | /api/me | Current user |
| GET | /api/orders | List user's orders |
| POST | /api/place-order | Place an order |
| GET | /api/stream | SSE order status stream |
| POST | /api/admin/login | Admin login |
| POST | /api/admin/logout | Admin logout |
| GET / PATCH | /api/admin/orders | List / update orders (admin) |

## Architecture Notes
- Cart state lives in localStorage, synced across components via a custom `cart-updated` window event
- Order status updates pushed via SSE rather than polling
- Input validation with Zod schemas on every mutating endpoint