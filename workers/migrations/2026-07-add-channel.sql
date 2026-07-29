-- Migración: agregar columna 'channel' a la tabla orders.
-- Ejecutar UNA sola vez en la Console de D1 (Studio) de electroyes-db.
ALTER TABLE orders ADD COLUMN channel TEXT NOT NULL DEFAULT 'mail';
