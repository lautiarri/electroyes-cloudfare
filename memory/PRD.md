# PRD — Electroyes Tienda Online (`/tienda`)

## Original problem
Build a new e-commerce section at `/tienda` inside the existing Electroyes site (https://electroyes.com.ar). It must keep the visual identity of the main site (coral logo, hex badge, light background), sell products with fast stock rotation, no login/checkout registration for buyers, and provide an admin panel for the owner.

## Users
- **Customer (public):** browses catalog, adds to cart (localStorage), checkouts with name/lastname/phone/email, gets email confirmation to store owner.
- **Admin (owner):** logs in with user/pass, manages products (CRUD with 1–4 base64 images) and views order history.

## Architecture
- **Backend:** FastAPI + Motor/MongoDB. JWT auth for admin. Resend for transactional emails.
- **Frontend:** React 19 + React Router 7 + Tailwind + shadcn tokens + Sonner toasts. CartContext with localStorage persistence.
- **Storage:** Product images as base64 data URLs in MongoDB (per user choice).

## Environment vars (backend/.env)
- `RESEND_API_KEY` — Resend key (provided by user)
- `SENDER_EMAIL` — `onboarding@resend.dev` (Resend sandbox)
- `ORDER_RECIPIENT_EMAIL` — `lautaro.arrietamaj@gmail.com`
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — `admin` / `electroyes2026`
- `JWT_SECRET`

## Implemented (Feb 2026)
- Catalog `/tienda` (grid + optional search) ✅
- Product detail `/tienda/producto/:code` (image gallery with thumbnails + arrows, qty selector, stock badge) ✅
- Cart `/tienda/carrito` (edit qty, remove, subtotal + total) ✅
- Checkout `/tienda/checkout` (name/lastname/phone/email) ✅
- Order confirmation `/tienda/confirmacion/:id` ✅
- Admin login `/tienda/admin/login` ✅
- Admin dashboard `/tienda/admin`: product CRUD + image upload (max 4, 2MB each), orders history ✅
- Email dispatch to owner on order via Resend ✅
- LocalStorage cart persistence ✅
- Mobile responsive header + footer matching Electroyes brand ✅

## API endpoints (`/api`)
- `POST /auth/admin/login`
- `GET /auth/admin/me`
- `GET/POST /products`, `GET /products/{code}`, `PUT/DELETE /products/{id}`
- `POST /orders` (public), `GET /orders` (admin)

## Backlog / Next
- **P1:** Add featured/highlighted products or category tagging when catalog grows
- **P1:** Send confirmation email copy to customer (currently only owner receives it)
- **P2:** Verify a custom sender domain in Resend for production deliverability
- **P2:** Order status flow (pending → contacted → paid → shipped)
- **P2:** Product image compression client-side to fit more/larger photos
- **P2:** Analytics / most-viewed products
