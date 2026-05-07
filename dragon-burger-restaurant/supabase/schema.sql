-- ============================================================
-- DRAGON BURGER RESTAURANT — SUPABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- ACCOUNT STATUS TABLE
CREATE TABLE IF NOT EXISTS account_status (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  is_active boolean DEFAULT true NOT NULL,
  activated_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  deactivated_at timestamptz,
  deactivated_reason text,
  created_at timestamptz DEFAULT now()
);

INSERT INTO account_status (is_active, activated_at)
VALUES (true, now())
ON CONFLICT DO NOTHING;

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  order_num integer NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  customer_name text NOT NULL,
  order_ref text,
  order_type text NOT NULL DEFAULT 'dine-in',
  items jsonb NOT NULL DEFAULT '[]',
  total integer NOT NULL DEFAULT 0,
  delivery_status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'unpaid',
  notes text,
  delivery_info jsonb,
  updated_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- MENU TABLE
CREATE TABLE IF NOT EXISTS menu (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- ORDER SEQUENCE TABLE
CREATE TABLE IF NOT EXISTS order_sequence (
  id integer PRIMARY KEY DEFAULT 1,
  last_num integer DEFAULT 0
);
INSERT INTO order_sequence (id, last_num) VALUES (1, 0) ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION next_order_num()
RETURNS integer AS $$
DECLARE next_val integer;
BEGIN
  UPDATE order_sequence SET last_num = last_num + 1 WHERE id = 1
  RETURNING last_num INTO next_val;
  RETURN next_val;
END;
$$ LANGUAGE plpgsql;

-- ROW LEVEL SECURITY
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_sequence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_full_access_orders" ON orders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_full_access_menu" ON menu
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_read_account_status" ON account_status
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_full_access_sequence" ON order_sequence
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "service_full_access_orders" ON orders
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_full_access_menu" ON menu
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_full_access_account" ON account_status
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_full_access_sequence" ON order_sequence
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- INDEXES
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON orders(payment_status);
CREATE INDEX IF NOT EXISTS orders_delivery_status_idx ON orders(delivery_status);
