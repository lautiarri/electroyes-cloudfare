# PRD — Electroyes Tienda Online (Cloudflare Full Stack)

## Original problem
E-commerce section for `electroyes.com.ar` at `/tienda`. No customer login/registration. Product grid, detail, cart, checkout that emails owner + customer and redirects to WhatsApp. Protected admin panel for products and orders. Originally deployed on DonWeb + Render + MongoDB Atlas + Resend + GitHub.

## Migration (Feb 2026)
User requested consolidation to a single free provider. Chose full **Cloudflare** migration:
- **DonWeb** → **Cloudflare Pages** (frontend hosting).
- **Render (FastAPI)** → **Cloudflare Workers (Hono/TS)** (backend).
- **MongoDB Atlas** → **Cloudflare D1** (SQLite).
- **Base64 images in DB** → **Cloudflare R2** (object storage).
- **DonWeb SMTP** → **Resend** (HTTP API from Worker, no SMTP).
- GitHub kept (needed for Pages/Workers Git integration).

## Users
- **Customer (public):** browses catalog, adds to cart (localStorage), checkouts with name/lastname/phone/email, gets email confirmation.
- **Admin:** logs in with user/pass, manages products (CRUD with 1–4 images uploaded to R2) and views/deletes orders.

## Architecture

```
Cloudflare Pages (frontend/)  ────►  Cloudflare Worker (workers/)
                                     ├─ D1 (products, orders)
                                     ├─ R2 (product images)
                                     └─ Resend HTTP (emails)
```

## Repo layout

- `frontend/` — React 19 CRA. Contains the pre-built Vite site under `public/preview-site/` served at `/preview-site/`.
- `workers/` — Cloudflare Workers backend (Hono + D1 + R2 + Resend).
- `site/` — original Vite build source of the pixel-perfect main site (already compiled into `frontend/public/preview-site/`).
- `README.md` / `DEPLOY.md` — deploy instructions.
- `.gitignore` — excludes `backend/`, `memory/`, `tests/`, `test_reports/` from public repo.

## API endpoints (Worker, prefix `/api`)
- `GET /` — health
- `POST /auth/admin/login`, `GET /auth/admin/me`
- `GET /products`, `GET /products/:code`
- `POST /products`, `PUT /products/:id`, `DELETE /products/:id` (admin)
- `POST /orders` (public), `GET /orders`, `DELETE /orders/:id` (admin)
- `POST /upload` (admin) — multipart/form-data image upload to R2
- `GET /images/:key` — serves image from R2 with immutable cache

## Env / bindings (Worker)
- Bindings: `DB` (D1), `IMAGES` (R2).
- Vars: `ADMIN_USERNAME`, `STORE_NAME`, `SENDER_EMAIL`, `ORDER_RECIPIENT_EMAIL`, `CORS_ORIGIN`.
- Secrets: `JWT_SECRET`, `ADMIN_PASSWORD`, `RESEND_API_KEY`.

## Frontend env
- `REACT_APP_BACKEND_URL` → set in Cloudflare Pages env to the Worker URL.

## Status (Feb 2026)
- ✅ Cloudflare Workers backend fully written and TypeScript-clean (`npx tsc --noEmit` passes, `wrangler dry-run` OK).
- ✅ D1 schema (products, orders) ready.
- ✅ R2 upload + serve endpoints implemented.
- ✅ Resend HTTP API integration.
- ✅ Frontend `AdminDashboard` updated: images now upload to R2 (URL stored) instead of base64.
- ✅ Frontend build passes cleanly.
- ✅ `_redirects` file for Cloudflare Pages SPA routing.
- ✅ Deploy guide (`DEPLOY.md`) with step-by-step for GitHub → Cloudflare Pages/Workers.

## Backlog / Next
- **P0:** User creates empty GitHub repo → pushes via Emergent "Save to Github" → connects to Cloudflare Pages + Workers per `DEPLOY.md`.
- **P1:** Verify `electroyes.com.ar` in Resend to send from `ventas@electroyes.com.ar` (DNS records needed).
- **P1:** Optionally connect custom domain `electroyes.com.ar` to Cloudflare Pages.
- **P2:** Featured products section on main site homepage.
- **P2:** Order status flow (pending → contacted → paid → shipped).
