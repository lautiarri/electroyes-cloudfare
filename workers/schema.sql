-- Electroyes D1 schema
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS orders;

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price REAL NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  images TEXT NOT NULL DEFAULT '[]', -- JSON array of image URLs
  created_at TEXT NOT NULL
);

CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_created ON products(created_at DESC);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  items TEXT NOT NULL,       -- JSON array of order items
  total REAL NOT NULL,
  created_at TEXT NOT NULL,
  email_sent INTEGER NOT NULL DEFAULT 0,
  customer_email_sent INTEGER NOT NULL DEFAULT 0,
  channel TEXT NOT NULL DEFAULT 'mail'    -- 'mail' | 'whatsapp'
);

CREATE INDEX idx_orders_created ON orders(created_at DESC);
