# Electroyes — Sitio + Tienda Online

Este repositorio contiene **dos proyectos** que conforman el sitio completo de Electroyes:

## 📁 Estructura

```
electroyes/
├── site/            → Sitio principal (electroyes.com.ar) — build estático (Vite)
│   ├── index.html
│   ├── assets/       → JS + CSS compilados
│   ├── _redirects    → Config Netlify (SPA fallback)
│   └── *.png         → Assets
│
├── backend/         → API de la Tienda (FastAPI + MongoDB + Resend)
│   ├── server.py    → Endpoints /api/products, /api/orders, /api/auth/admin/*
│   ├── requirements.txt
│   └── .env         → Variables (NO se commitea; ver .env.example)
│
├── frontend/        → App de la Tienda (React 19 + Tailwind)
│   └── src/
│       ├── pages/     → Catálogo, ProductDetail, Cart, Checkout, Admin
│       ├── components/ → Header, Footer, Layout (identidad Electroyes)
│       ├── context/   → CartContext (persistencia en localStorage)
│       └── lib/       → api.js, format.js
│
└── memory/PRD.md    → Requisitos y roadmap
```

## 🛒 Tienda Online (`/tienda`)

### Rutas públicas
- `/tienda` — Catálogo grilla de productos
- `/tienda/producto/:code` — Detalle con galería de 1-4 imágenes
- `/tienda/carrito` — Carrito (persiste en localStorage)
- `/tienda/checkout` — Datos del cliente (nombre, apellido, teléfono, email)
- `/tienda/confirmacion/:id` — Confirmación del pedido

### Panel de administración
- `/tienda/admin/login` — Login (usuario/contraseña de `.env`)
- `/tienda/admin` — CRUD de productos + historial de pedidos

**Credenciales por defecto** (cambiar en `backend/.env`):
- Usuario: `admin`
- Contraseña: `electroyes2026`

## 📧 Envío de emails

Al confirmar un pedido se envía un email al dueño (`ORDER_RECIPIENT_EMAIL`) usando **Resend**. En modo sandbox solo se entrega al email verificado en la cuenta. Para producción, verificar un dominio propio en https://resend.com/domains.

## 🚀 Deployment

### Opción 1 — Sitio + tienda por separado (más simple)
- Sitio principal (`site/`) → Netlify / Vercel / cualquier hosting estático.
- Tienda (`backend/` + `frontend/`) → Deploy en Emergent u otra plataforma con MongoDB.
- Linkear el botón "Tienda Online" desde el sitio principal a la URL de la tienda.

### Opción 2 — Integración full (requiere código fuente del sitio principal)
Migrar los contenidos del sitio (`site/`) como rutas dentro del proyecto `frontend/` de la tienda, quedando un solo despliegue.

## 🔧 Variables de entorno (backend/.env)

```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="electroyes"
RESEND_API_KEY="re_..."
SENDER_EMAIL="onboarding@resend.dev"
ORDER_RECIPIENT_EMAIL="tu-email@ejemplo.com"
JWT_SECRET="cambiar-por-un-secreto-fuerte"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="electroyes2026"
STORE_NAME="Electroyes"
CORS_ORIGINS="*"
```

## 🧑‍💻 Stack

- **Backend:** Python 3 · FastAPI · Motor (MongoDB async) · Resend · PyJWT
- **Frontend:** React 19 · React Router 7 · Tailwind CSS · shadcn/ui · Sonner · Manrope font
- **Identidad:** paleta coral (#F5675A) + crema (#FDF6F5), badge hexagonal EY
