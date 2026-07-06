-- SQL Migration Script for Merchandise Orders & Payments Setup
-- Run this in the Supabase SQL Editor

-- 1. Create orders table if not exists
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL,
  order_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create payments table if not exists (for transfer receipts confirm data)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confirm_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for orders
DROP POLICY IF EXISTS "Allow public insert on orders" ON orders;
CREATE POLICY "Allow public insert on orders" ON orders 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on orders" ON orders;
CREATE POLICY "Allow public select on orders" ON orders 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Allow admin all on orders" ON orders;
CREATE POLICY "Allow admin all on orders" ON orders 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- 5. Create RLS Policies for payments
DROP POLICY IF EXISTS "Allow public insert on payments" ON payments;
CREATE POLICY "Allow public insert on payments" ON payments 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on payments" ON payments;
CREATE POLICY "Allow public select on payments" ON payments 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Allow admin all on payments" ON payments;
CREATE POLICY "Allow admin all on payments" ON payments 
  FOR ALL 
  USING (auth.role() = 'authenticated');
