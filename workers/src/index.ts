import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from 'hono/jwt';

// ============ Bindings ============
type Bindings = {
  DB: D1Database;
  IMAGES: R2Bucket;
  JWT_SECRET: string;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  RESEND_API_KEY: string;
  SENDER_EMAIL: string;
  ORDER_RECIPIENT_EMAIL: string;
  STORE_NAME: string;
  CORS_ORIGIN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ============ CORS ============
app.use('*', async (c, next) => {
  const middleware = cors({
    origin: c.env.CORS_ORIGIN || '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  return middleware(c, next);
});

// ============ Helpers ============
const nowIso = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();

async function requireAdmin(c: any): Promise<Response | null> {
  const auth = c.req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return c.json({ detail: 'Unauthorized' }, 401);
  }
  try {
    const payload = await verify(auth.slice(7), c.env.JWT_SECRET, 'HS256');
    if (payload.sub !== c.env.ADMIN_USERNAME) {
      return c.json({ detail: 'Forbidden' }, 403);
    }
    return null;
  } catch {
    return c.json({ detail: 'Invalid token' }, 401);
  }
}

function productRowToJson(row: any) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description || '',
    price: row.price,
    stock: row.stock,
    images: JSON.parse(row.images || '[]'),
    created_at: row.created_at,
  };
}

function orderRowToJson(row: any) {
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    phone: row.phone,
    email: row.email,
    items: JSON.parse(row.items || '[]'),
    total: row.total,
    created_at: row.created_at,
    email_sent: !!row.email_sent,
    customer_email_sent: !!row.customer_email_sent,
  };
}

// ============ Health ============
const health = { service: 'electroyes-tienda', status: 'ok' };
app.get('/', (c) => c.json(health));
app.get('/api', (c) => c.json(health));
app.get('/api/', (c) => c.json(health));

// ============ Auth ============
app.post('/api/auth/admin/login', async (c) => {
  const body = await c.req.json<{ username: string; password: string }>();
  if (body.username !== c.env.ADMIN_USERNAME || body.password !== c.env.ADMIN_PASSWORD) {
    return c.json({ detail: 'Credenciales inválidas' }, 401);
  }
  const token = await sign(
    { sub: body.username, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12 },
    c.env.JWT_SECRET,
    'HS256'
  );
  return c.json({ token });
});

app.get('/api/auth/admin/me', async (c) => {
  const guard = await requireAdmin(c);
  if (guard) return guard;
  return c.json({ username: c.env.ADMIN_USERNAME });
});

// ============ Products ============
app.get('/api/products', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM products ORDER BY created_at DESC LIMIT 1000'
  ).all();
  return c.json(results.map(productRowToJson));
});

app.get('/api/products/:code', async (c) => {
  const code = c.req.param('code');
  const row = await c.env.DB.prepare('SELECT * FROM products WHERE code = ?').bind(code).first();
  if (!row) return c.json({ detail: 'Producto no encontrado' }, 404);
  return c.json(productRowToJson(row));
});

app.post('/api/products', async (c) => {
  const guard = await requireAdmin(c);
  if (guard) return guard;
  const body = await c.req.json<any>();
  if (!body.code || !body.name || typeof body.price !== 'number') {
    return c.json({ detail: 'Datos inválidos' }, 400);
  }
  const images: string[] = Array.isArray(body.images) ? body.images : [];
  if (images.length > 4) return c.json({ detail: 'Máximo 4 imágenes' }, 400);

  const exists = await c.env.DB.prepare('SELECT id FROM products WHERE code = ?').bind(body.code).first();
  if (exists) return c.json({ detail: 'El código ya existe' }, 400);

  const doc = {
    id: uuid(),
    code: body.code,
    name: body.name,
    description: body.description || '',
    price: Number(body.price),
    stock: parseInt(body.stock ?? 0),
    images: JSON.stringify(images),
    created_at: nowIso(),
  };
  await c.env.DB.prepare(
    'INSERT INTO products (id, code, name, description, price, stock, images, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(doc.id, doc.code, doc.name, doc.description, doc.price, doc.stock, doc.images, doc.created_at)
    .run();
  return c.json(productRowToJson(doc));
});

app.put('/api/products/:id', async (c) => {
  const guard = await requireAdmin(c);
  if (guard) return guard;
  const id = c.req.param('id');
  const body = await c.req.json<any>();

  const existing = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
  if (!existing) return c.json({ detail: 'Producto no encontrado' }, 404);

  if (body.code && body.code !== existing.code) {
    const conflict = await c.env.DB.prepare('SELECT id FROM products WHERE code = ? AND id != ?').bind(body.code, id).first();
    if (conflict) return c.json({ detail: 'El código ya existe' }, 400);
  }
  if (body.images && Array.isArray(body.images) && body.images.length > 4) {
    return c.json({ detail: 'Máximo 4 imágenes' }, 400);
  }

  const merged: any = { ...existing };
  if (body.code !== undefined) merged.code = body.code;
  if (body.name !== undefined) merged.name = body.name;
  if (body.description !== undefined) merged.description = body.description;
  if (body.price !== undefined) merged.price = Number(body.price);
  if (body.stock !== undefined) merged.stock = parseInt(body.stock);
  if (body.images !== undefined) merged.images = JSON.stringify(body.images);

  await c.env.DB.prepare(
    'UPDATE products SET code=?, name=?, description=?, price=?, stock=?, images=? WHERE id=?'
  )
    .bind(merged.code, merged.name, merged.description, merged.price, merged.stock, merged.images, id)
    .run();

  return c.json(productRowToJson(merged));
});

app.delete('/api/products/:id', async (c) => {
  const guard = await requireAdmin(c);
  if (guard) return guard;
  const id = c.req.param('id');
  const r = await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
  if (r.meta.changes === 0) return c.json({ detail: 'Producto no encontrado' }, 404);
  return c.json({ ok: true });
});

// ============ Image upload (R2) ============
app.post('/api/upload', async (c) => {
  const guard = await requireAdmin(c);
  if (guard) return guard;
  const form = await c.req.formData();
  const file = form.get('file') as unknown as File | null;
  if (!file || typeof (file as any).arrayBuffer !== 'function') return c.json({ detail: 'Falta el archivo' }, 400);
  if (file.size > 2 * 1024 * 1024) return c.json({ detail: 'Imagen > 2MB' }, 400);
  const contentType = file.type || 'application/octet-stream';
  if (!contentType.startsWith('image/')) return c.json({ detail: 'Solo imágenes' }, 400);

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const key = `${uuid()}.${ext}`;
  await c.env.IMAGES.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' },
  });
  const url = new URL(c.req.url);
  const publicUrl = `${url.origin}/api/images/${key}`;
  return c.json({ url: publicUrl, key });
});

app.get('/api/images/:key', async (c) => {
  const key = c.req.param('key');
  const obj = await c.env.IMAGES.get(key);
  if (!obj) return c.text('Not found', 404);
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('etag', obj.httpEtag);
  return new Response(obj.body, { headers });
});

// ============ Orders ============
type OrderItemIn = { product_id: string; code: string; name: string; quantity: number; unit_price: number; subtotal: number };

app.post('/api/orders', async (c) => {
  const body = await c.req.json<any>();
  const items: OrderItemIn[] = Array.isArray(body.items) ? body.items : [];
  if (!items.length) return c.json({ detail: 'El pedido no tiene productos' }, 400);
  if (!body.first_name || !body.last_name || !body.phone || !body.email) {
    return c.json({ detail: 'Faltan datos del cliente' }, 400);
  }

  const validated: OrderItemIn[] = [];
  let total = 0;
  for (const it of items) {
    const prodRow = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(it.product_id).first<any>();
    if (!prodRow) return c.json({ detail: `Producto ${it.name} ya no existe` }, 400);
    if (prodRow.stock < it.quantity) return c.json({ detail: `Sin stock suficiente para ${prodRow.name}` }, 400);
    const subtotal = Math.round(prodRow.price * it.quantity * 100) / 100;
    total += subtotal;
    validated.push({
      product_id: prodRow.id,
      code: prodRow.code,
      name: prodRow.name,
      quantity: it.quantity,
      unit_price: prodRow.price,
      subtotal,
    });
  }
  total = Math.round(total * 100) / 100;

  const order = {
    id: uuid(),
    first_name: String(body.first_name).trim(),
    last_name: String(body.last_name).trim(),
    phone: String(body.phone).trim(),
    email: String(body.email).trim(),
    items: validated,
    total,
    created_at: nowIso(),
  };

  // Decrement stock
  for (const it of validated) {
    await c.env.DB.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').bind(it.quantity, it.product_id).run();
  }

  const emailOk = await sendOrderEmail(c.env, order);
  const customerOk = await sendCustomerConfirmation(c.env, order);

  await c.env.DB.prepare(
    'INSERT INTO orders (id, first_name, last_name, phone, email, items, total, created_at, email_sent, customer_email_sent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(
      order.id,
      order.first_name,
      order.last_name,
      order.phone,
      order.email,
      JSON.stringify(order.items),
      order.total,
      order.created_at,
      emailOk ? 1 : 0,
      customerOk ? 1 : 0
    )
    .run();

  return c.json({ ...order, email_sent: emailOk, customer_email_sent: customerOk });
});

app.get('/api/orders', async (c) => {
  const guard = await requireAdmin(c);
  if (guard) return guard;
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM orders ORDER BY created_at DESC LIMIT 1000'
  ).all();
  return c.json(results.map(orderRowToJson));
});

app.delete('/api/orders/:id', async (c) => {
  const guard = await requireAdmin(c);
  if (guard) return guard;
  const id = c.req.param('id');
  const r = await c.env.DB.prepare('DELETE FROM orders WHERE id = ?').bind(id).run();
  if (r.meta.changes === 0) return c.json({ detail: 'Pedido no encontrado' }, 404);
  return c.json({ ok: true });
});

// ============ Email (Resend HTTP API) ============
function money(n: number) {
  return `$${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function buildOwnerEmailHtml(env: Bindings, order: any): string {
  const rows = order.items
    .map(
      (i: any) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:13px;color:#333;">${i.code}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:13px;color:#333;">${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:13px;color:#333;text-align:center;">${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:13px;color:#333;text-align:right;">${money(i.unit_price)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:13px;color:#333;text-align:right;"><b>${money(i.subtotal)}</b></td>
    </tr>`
    )
    .join('');
  return `<!doctype html><html><body style="margin:0;padding:0;background:#fdf6f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6f5;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);">
        <tr><td style="background:#f5675a;padding:24px;color:#fff;font-family:Arial,sans-serif;">
          <div style="font-size:22px;font-weight:700;">Nuevo pedido — ${env.STORE_NAME}</div>
          <div style="font-size:13px;opacity:0.9;margin-top:4px;">Recibido el ${order.created_at}</div>
        </td></tr>
        <tr><td style="padding:24px;font-family:Arial,sans-serif;color:#333;">
          <h3 style="margin:0 0 12px 0;font-size:16px;color:#f5675a;">Datos del cliente</h3>
          <p style="margin:4px 0;font-size:14px;"><b>Nombre:</b> ${order.first_name} ${order.last_name}</p>
          <p style="margin:4px 0;font-size:14px;"><b>Teléfono:</b> ${order.phone}</p>
          <p style="margin:4px 0;font-size:14px;"><b>Email:</b> ${order.email}</p>
          <h3 style="margin:24px 0 12px 0;font-size:16px;color:#f5675a;">Detalle del pedido</h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <thead><tr style="background:#fdf6f5;">
              <th style="padding:8px;text-align:left;font-family:Arial,sans-serif;font-size:12px;color:#666;">Código</th>
              <th style="padding:8px;text-align:left;font-family:Arial,sans-serif;font-size:12px;color:#666;">Producto</th>
              <th style="padding:8px;text-align:center;font-family:Arial,sans-serif;font-size:12px;color:#666;">Cant.</th>
              <th style="padding:8px;text-align:right;font-family:Arial,sans-serif;font-size:12px;color:#666;">P. Unit.</th>
              <th style="padding:8px;text-align:right;font-family:Arial,sans-serif;font-size:12px;color:#666;">Subtotal</th>
            </tr></thead><tbody>${rows}</tbody>
          </table>
          <div style="text-align:right;margin-top:20px;font-family:Arial,sans-serif;font-size:18px;color:#111;"><b>Total: ${money(order.total)}</b></div>
        </td></tr>
        <tr><td style="background:#111;padding:16px;text-align:center;color:#aaa;font-family:Arial,sans-serif;font-size:12px;">${env.STORE_NAME} · Pedido generado desde la tienda online</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildCustomerEmailHtml(env: Bindings, order: any): string {
  const rows = order.items
    .map(
      (i: any) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:13px;color:#333;">${i.code}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:13px;color:#333;">${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:13px;color:#333;text-align:center;">${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:13px;color:#333;text-align:right;">${money(i.unit_price)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;font-size:13px;color:#333;text-align:right;"><b>${money(i.subtotal)}</b></td>
    </tr>`
    )
    .join('');
  return `<!doctype html><html><body style="margin:0;padding:0;background:#fdf6f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6f5;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);">
        <tr><td style="background:#f5675a;padding:28px 24px;color:#fff;font-family:Arial,sans-serif;text-align:center;">
          <div style="font-size:24px;font-weight:700;">¡Gracias por tu compra, ${order.first_name}!</div>
          <div style="font-size:14px;opacity:0.95;margin-top:8px;">Recibimos tu pedido y ya nos estamos poniendo en contacto.</div>
        </td></tr>
        <tr><td style="padding:24px;font-family:Arial,sans-serif;color:#333;">
          <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#444;">
            Nº de pedido: <b>#${String(order.id).slice(0, 8).toUpperCase()}</b><br/>
            Fecha: ${order.created_at}
          </p>
          <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#444;">
            A la brevedad te vamos a contactar por WhatsApp al <b>${order.phone}</b> para coordinar la entrega y el pago.
          </p>
          <h3 style="margin:24px 0 12px 0;font-size:16px;color:#f5675a;">Detalle de tu pedido</h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <thead><tr style="background:#fdf6f5;">
              <th style="padding:8px;text-align:left;font-family:Arial,sans-serif;font-size:12px;color:#666;">Código</th>
              <th style="padding:8px;text-align:left;font-family:Arial,sans-serif;font-size:12px;color:#666;">Producto</th>
              <th style="padding:8px;text-align:center;font-family:Arial,sans-serif;font-size:12px;color:#666;">Cant.</th>
              <th style="padding:8px;text-align:right;font-family:Arial,sans-serif;font-size:12px;color:#666;">P. Unit.</th>
              <th style="padding:8px;text-align:right;font-family:Arial,sans-serif;font-size:12px;color:#666;">Subtotal</th>
            </tr></thead><tbody>${rows}</tbody>
          </table>
          <div style="text-align:right;margin-top:20px;font-family:Arial,sans-serif;font-size:18px;color:#111;"><b>Total: ${money(order.total)}</b></div>
        </td></tr>
        <tr><td style="background:#111;padding:16px;text-align:center;color:#aaa;font-family:Arial,sans-serif;font-size:12px;">${env.STORE_NAME} · Servicio Técnico de Confianza</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function resendSend(env: Bindings, to: string, subject: string, html: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;
  if (!to) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${env.STORE_NAME} <${env.SENDER_EMAIL}>`,
        to: [to],
        subject,
        html,
      }),
    });
    if (!r.ok) {
      console.error('Resend failed', r.status, await r.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error('Resend error', e);
    return false;
  }
}

async function sendOrderEmail(env: Bindings, order: any): Promise<boolean> {
  if (!env.ORDER_RECIPIENT_EMAIL) return false;
  return resendSend(
    env,
    env.ORDER_RECIPIENT_EMAIL,
    `Nuevo pedido #${String(order.id).slice(0, 8)} — ${order.first_name} ${order.last_name}`,
    buildOwnerEmailHtml(env, order)
  );
}

async function sendCustomerConfirmation(env: Bindings, order: any): Promise<boolean> {
  if (!order.email) return false;
  return resendSend(
    env,
    order.email,
    `Confirmación de tu pedido #${String(order.id).slice(0, 8)} — ${env.STORE_NAME}`,
    buildCustomerEmailHtml(env, order)
  );
}

// ============ 404 ============
app.notFound((c) => c.json({ detail: 'Not Found' }, 404));

export default app;
