# Electroyes — Tienda Online (Cloudflare Full Stack)

Monorepo con la tienda online de Electroyes desplegada 100 % sobre Cloudflare:

- **`frontend/`** → app React (CRA) que sirve el sitio principal (`/`) y la tienda (`/tienda/*`) + panel de administración.
- **`site/`** → build estático del sitio pixel-perfect (Vite) que se sirve bajo `/preview-site/`.
- **`workers/`** → backend Cloudflare Workers (Hono) con D1 (SQLite), R2 (imágenes) y Resend (emails).

## Arquitectura

```
                    ┌───────────────────────────┐
   Usuario  ───►    │  Cloudflare Pages         │  ← frontend/ (build)  +  site/
                    │  electroyes.com.ar        │
                    └───────────┬───────────────┘
                                │  fetch /api/*
                    ┌───────────▼───────────────┐
                    │  Cloudflare Worker (Hono) │
                    │  api.electroyes.workers…  │
                    │                           │
                    │  ├─ D1 (products, orders) │
                    │  ├─ R2 (imágenes)         │
                    │  └─ Resend (emails)       │
                    └───────────────────────────┘
```

## Guía de deploy paso a paso

Ver **[`DEPLOY.md`](./DEPLOY.md)** para las instrucciones completas.

## Stack

- **Frontend:** React 19, React Router 7, Tailwind, shadcn/ui.
- **Backend:** Cloudflare Workers + Hono + D1 (SQLite) + R2 (object storage).
- **Emails:** Resend (HTTP API).
- **Deploy:** Cloudflare Pages (frontend) + Cloudflare Workers (backend), via GitHub integration.
