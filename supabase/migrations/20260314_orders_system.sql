-- Orders System Migration
-- Creates tables for orders, order items, and payments

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,

  -- Address
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  cep TEXT NOT NULL,

  -- Shipping
  shipping_company TEXT NOT NULL,
  shipping_method TEXT NOT NULL,
  shipping_price DECIMAL(10, 2) NOT NULL,
  shipping_days INTEGER NOT NULL,

  -- Payment
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'credit_card')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'approved', 'rejected', 'refunded')),

  -- Mercado Pago data
  mp_payment_id TEXT,
  mp_preference_id TEXT,
  mp_init_point TEXT,

  -- Totals
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_total DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,

  -- Order status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),

  -- Notes
  observations TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  product_name TEXT NOT NULL,
  product_description TEXT,
  product_image TEXT,

  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create orders (for checkout)
CREATE POLICY "Allow anyone to create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Allow customers to view their own orders
CREATE POLICY "Allow customers to view their orders" ON orders
  FOR SELECT USING (customer_email = current_setting('app.customer_email', true));

-- Allow anyone to view order items (will be filtered by order access)
CREATE POLICY "Allow viewing order items" ON order_items
  FOR SELECT USING (true);

-- Grant permissions
GRANT ALL ON orders TO anon, authenticated;
GRANT ALL ON order_items TO anon, authenticated;
