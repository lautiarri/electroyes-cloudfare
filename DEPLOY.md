# Deploy a Cloudflare — Paso a paso

Este proyecto se despliega en **Cloudflare** en dos partes: el **backend** (Worker + D1 + R2) y el **frontend** (Pages).

Todo el proceso se hace desde el navegador conectando tu repositorio de GitHub. Requiere solamente una cuenta gratis en Cloudflare y otra en Resend.

---

## 0) Preparar credenciales

Antes de empezar tené a mano:

- Cuenta de Cloudflare (gratis): https://dash.cloudflare.com/sign-up
- Cuenta de Resend (gratis, ya la creaste): https://resend.com
- API Key de Resend (empieza con `re_...`).
- El repositorio de GitHub con este código.

---

## 1) Base de datos D1

1. Cloudflare Dashboard → **Workers & Pages** → sidebar **D1** → **Create database**.
2. Nombre: `electroyes-db` → **Create**.
3. En la pestaña **Console** de la base de datos, pegá el contenido de [`workers/schema.sql`](./workers/schema.sql) y clickeá **Execute**. Esto crea las tablas `products` y `orders`.
4. Volvé al listado de databases y copiá el **Database ID** (formato `xxxxxxxx-xxxx-...`). Lo vas a necesitar en el paso 4.

---

## 2) Bucket R2 (imágenes)

1. Cloudflare Dashboard → **R2 Object Storage** → **Create bucket**.
2. Nombre: `electroyes-images` → **Create**. (Location: Automatic).
3. Dejá el bucket como está (**no** hace falta activar acceso público — el Worker las sirve).

> Si es tu primera vez usando R2, Cloudflare te va a pedir un método de pago aunque el plan gratuito no cobra nada por debajo de 10 GB.

---

## 3) Deploy del Worker (backend)

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Workers** → **Deploy from Git**.
2. Conectá tu cuenta de GitHub y elegí el repositorio del proyecto.
3. Configuración:
   - **Project name:** `electroyes-cloudfare`
   - **Production branch:** `main`
   - **Root directory:** `workers`
   - **Build command:** `npm install`  *(⚠️ importante para evitar que Cloudflare autodetecte yarn del frontend)*
   - **Deploy command:** `npx wrangler deploy`
4. Antes de dar **Save and Deploy**, agregá las variables (más abajo).

### Variables de entorno del Worker

En la pantalla de deploy, sección **Variables and Secrets**, agregá:

| Nombre                  | Tipo   | Valor                                    |
| ----------------------- | ------ | ---------------------------------------- |
| `JWT_SECRET`            | Secret | *(algo largo y random, p.ej. `openssl rand -hex 32`)* |
| `ADMIN_PASSWORD`        | Secret | `electroyes2026` *(o el que elijas)*    |
| `RESEND_API_KEY`        | Secret | `re_...` (tu key de Resend)              |
| `ADMIN_USERNAME`        | Text   | `admin`                                  |
| `STORE_NAME`            | Text   | `Electroyes`                             |
| `SENDER_EMAIL`          | Text   | `onboarding@resend.dev` *(hasta verificar dominio)* |
| `ORDER_RECIPIENT_EMAIL` | Text   | `ventas@electroyes.com.ar` *(o el que quieras)*    |
| `CORS_ORIGIN`           | Text   | `*` (después lo cambiamos por tu dominio) |

### Bindings del Worker

En **Bindings**:

- **D1 Database** → variable name: `DB` → database: `electroyes-db`
- **R2 Bucket** → variable name: `IMAGES` → bucket: `electroyes-images`

También editá **`workers/wrangler.toml`** en el repo y reemplazá `REPLACE_WITH_D1_ID_AFTER_CREATE` por el Database ID copiado en el paso 1. Hacé commit y push.

4. **Save and Deploy**. Cloudflare va a construir y desplegar el Worker.
5. Al terminar te da una URL tipo `https://electroyes-cloudfare.tu-usuario.workers.dev`. **Copiala**, la necesitás para el frontend.

### Verificar que el Worker anda

Abrí `https://electroyes-cloudfare.tu-usuario.workers.dev/api/` en el navegador. Deberías ver:
```json
{"service":"electroyes-tienda","status":"ok"}
```

---

## 4) Deploy del Frontend en Cloudflare Pages

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Elegí el mismo repositorio.
3. Configuración de build:
   - **Project name:** `electroyes` (esto define el subdominio `electroyes.pages.dev`)
   - **Production branch:** `main`
   - **Framework preset:** `Create React App`
   - **Build command:** `yarn install && yarn build`
   - **Build output directory:** `build`
   - **Root directory:** `frontend`
4. **Environment variables (Production)**:
   - `REACT_APP_BACKEND_URL` → la URL del Worker del paso 3 *(ej. `https://electroyes-cloudfare.tu-usuario.workers.dev`)*
5. **Save and Deploy**. Espera 1-2 minutos.
6. Cuando termine, obtenés una URL tipo `https://electroyes.pages.dev`.

---

## 5) Conectar tu dominio propio (opcional)

En **Pages → tu proyecto → Custom Domains → Set up a custom domain** → agregá `electroyes.com.ar`.

Cloudflare te va a decir qué registros DNS agregar en el panel de tu proveedor (o si ya tenés el dominio en Cloudflare, es un click).

Una vez propagado (5-30 min):

- Actualizá la variable `CORS_ORIGIN` del Worker a `https://electroyes.com.ar`.
- Volvé a hacer un deploy del Worker (**Deployments → Retry deployment**).

---

## 6) Verificar dominio en Resend (para mails con `ventas@electroyes.com.ar`)

Mientras no verifiques dominio, Resend solo puede mandar mails desde `onboarding@resend.dev` y **solo a la casilla con la que registraste Resend**. Para mandar al cliente y desde `ventas@electroyes.com.ar`:

1. Resend Dashboard → **Domains** → **Add Domain** → `electroyes.com.ar`.
2. Resend te muestra 4-5 registros DNS (SPF/DKIM/DMARC) para agregar en tu panel DNS.
3. Cargalos en el DNS de `electroyes.com.ar`.
4. Click **Verify** en Resend cuando propague (5-30 min).
5. En Cloudflare Worker, cambiá la variable `SENDER_EMAIL` a `ventas@electroyes.com.ar`.
6. Redeploy del Worker.

---

## 7) Primer ingreso al admin

- URL: `https://electroyes.com.ar/tienda/admin/login` (o la URL de Pages).
- Usuario: `admin`
- Contraseña: la que configuraste en `ADMIN_PASSWORD`.

Cargá los productos desde el panel. Cada imagen se sube a R2 y queda servida por el Worker en `/api/images/{key}`.

---

## Costos

- **Cloudflare Workers:** gratis hasta 100.000 requests/día.
- **D1:** gratis hasta 5 GB de storage + 5M reads/día.
- **R2:** gratis hasta 10 GB de storage + 1M requests A/mes.
- **Pages:** gratis, tráfico ilimitado.
- **Resend:** gratis 3.000 mails/mes, 100/día.

Con un tráfico normal de tienda chica: **$0 / mes**.

---

## FAQ

**¿Cómo cambio la contraseña de admin?**
Cloudflare Dashboard → Workers → `electroyes-cloudfare` → **Settings → Variables and Secrets** → editá `ADMIN_PASSWORD` → Save. Redeploy.

**¿Cómo cambio el destinatario de emails?**
Igual que arriba pero con `ORDER_RECIPIENT_EMAIL`.

**¿Cómo veo los logs de errores?**
Workers → `electroyes-cloudfare` → **Logs → Real-time logs**.

**Se rompió un deploy, ¿cómo vuelvo atrás?**
Pages/Workers → tu proyecto → **Deployments** → elegí un deploy anterior → **Rollback to this deployment**.
