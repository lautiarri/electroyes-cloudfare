# Electroyes API (Cloudflare Worker)

Backend de la tienda Electroyes desplegado en Cloudflare Workers.

## Stack

- **Runtime:** Cloudflare Workers (V8 isolates).
- **Framework:** Hono.
- **Base de datos:** D1 (SQLite).
- **Storage:** R2 (imágenes de productos).
- **Auth:** JWT (HS256).
- **Emails:** Resend HTTP API.

## Endpoints

### Públicos
- `GET  /api/` — health check
- `GET  /api/products` — lista de productos
- `GET  /api/products/:code` — detalle por código
- `POST /api/orders` — crear pedido (valida stock, envía mails)
- `GET  /api/images/:key` — servir imagen desde R2

### Admin (requieren `Authorization: Bearer <jwt>`)
- `POST   /api/auth/admin/login` — login
- `GET    /api/auth/admin/me` — validar token
- `POST   /api/products` — crear producto
- `PUT    /api/products/:id` — editar
- `DELETE /api/products/:id` — eliminar
- `POST   /api/upload` — subir imagen a R2 (multipart/form-data)
- `GET    /api/orders` — listar pedidos
- `DELETE /api/orders/:id` — eliminar pedido

## Desarrollo local

```bash
cd workers
yarn install
# Crear DB local:
npx wrangler d1 execute electroyes-db --local --file=./schema.sql
# Crear archivo .dev.vars con secrets:
cat > .dev.vars <<EOF
JWT_SECRET="dev-secret"
ADMIN_PASSWORD="admin"
RESEND_API_KEY="re_xxx"
EOF
npx wrangler dev
```

## Deploy a producción

Ver [`../DEPLOY.md`](../DEPLOY.md).

Alternativa por CLI:
```bash
npx wrangler d1 create electroyes-db      # copiar el ID a wrangler.toml
npx wrangler r2 bucket create electroyes-images
npx wrangler d1 execute electroyes-db --remote --file=./schema.sql
npx wrangler secret put JWT_SECRET
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put RESEND_API_KEY
npx wrangler deploy
```
