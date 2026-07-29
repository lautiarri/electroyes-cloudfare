# PRD — Electroyes Tienda Online (Cloudflare Full Stack)

## Original problem
E-commerce section for `electroyes.com.ar` at `/tienda`. No customer login. Product grid, detail, cart, checkout emailing owner + customer + WhatsApp redirect. Protected admin panel for products + orders. Originally deployed on DonWeb + Render + MongoDB + Resend + GitHub, migrated Feb 2026 to Cloudflare (Workers + D1 + R2 + Pages) + Resend HTTP API + GitHub.

## Users
- **Customer:** browses `/tienda`, adds to cart (localStorage), checkouts via 2 channels:
  - **Mail:** fills form → email to admin + customer.
  - **WhatsApp:** click button → order saved in DB + opens WhatsApp app with pre-filled message to +5491151529070.
- **Admin:** logs in, manages products (CRUD with 1–4 images to R2), views/deletes orders, views detailed sales report with Excel export.

## Deployed URLs
- Frontend (Cloudflare Pages): `https://electroyes-cloudfare.pages.dev`
- Backend (Cloudflare Workers): `https://electroyes-cloudfare.electroyes.workers.dev`

## Repo layout
- `frontend/` — React 19 CRA (site + tienda + admin).
- `workers/` — Cloudflare Workers backend (Hono/TS + D1 + R2).
- `workers/migrations/` — D1 migration SQL scripts.
- `README.md` / `DEPLOY.md` — deploy instructions.

## API endpoints (Worker `/api/*`)
- Public: `GET /`, `GET /api/`, `GET /api/products`, `GET /api/products/:code`, `POST /api/orders`, `GET /api/images/:key`.
- Admin (Bearer JWT): `POST /auth/admin/login`, `GET /auth/admin/me`, `POST/PUT/DELETE /products/*`, `POST /upload`, `GET/DELETE /orders/*`.

## Data model (D1)
- **products** `(id, code, name, description, price, stock, images JSON, created_at)`.
- **orders** `(id, first_name, last_name, phone, email, items JSON, total, created_at, email_sent, customer_email_sent, channel)` — `channel` ∈ `{mail, whatsapp}`.

## Status (Jul 2026)

### ✅ Done
- Full Cloudflare stack live.
- 21 DNS records prepared in Cloudflare (still pending nameserver switch at NIC.ar).
- Resend domain verified for `electroyes.com.ar`.
- Native SMTP (DonWeb) fully replaced by Resend HTTP.
- Admin: products CRUD, orders view/delete, image upload to R2, **new Reportes tab with Excel export**.
- Cart: **dual button "GENERAR PEDIDO POR MAIL" + "GENERAR PEDIDO POR WHATSAPP"**.
- Backend: `channel` field added to orders; WhatsApp orders skip emails; email failures now return `email_error` string in response for diagnostics.
- Frontend UI test pass 100% (testing_agent iteration_7).

### 🔴 Pending user actions
1. **D1 migration** — run once in D1 Console (Studio):
   ```sql
   ALTER TABLE orders ADD COLUMN channel TEXT NOT NULL DEFAULT 'mail';
   ```
2. **Fix email delivery on production**: `SENDER_EMAIL` env var in Worker likely still `onboarding@resend.dev`. Must be changed to `ventas@electroyes.com.ar` (or verified sender). Additionally `ORDER_RECIPIENT_EMAIL` may need review.
3. **Push new code** via "Save to Github" → triggers Pages + Workers rebuild.
4. **DNS migration to Cloudflare** — change nameservers at NIC.ar (domain registrar) to `xxxxx.ns.cloudflare.com`. All records already loaded.
5. **Connect custom domain** `electroyes.com.ar` to Pages + change `CORS_ORIGIN` from `*` to the domain.

### 📋 Backlog
- **P2:** Order status flow (pending → contacted → paid → shipped).
- **P2:** Featured products on main site home.
- **P2:** Split AdminDashboard.jsx into smaller components (ReportsTab, ProductForm).
- **P3:** Move `WHATSAPP_NUMBER` to a shared constant.
