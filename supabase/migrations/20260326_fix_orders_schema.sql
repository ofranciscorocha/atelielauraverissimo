-- =============================================================
-- FIX: Correções no schema de pedidos
-- 2026-03-26
-- =============================================================

-- 1. Adicionar coluna user_id (FK para auth.users, nullable pois pedido pode ser sem conta)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Adicionar tracking_number (estava no código mas não no schema)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- 3. Adicionar order_number (usado no Profile.tsx)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_number TEXT;

-- Criar sequência para order_number se não existir
CREATE SEQUENCE IF NOT EXISTS orders_order_number_seq START 1000;

-- Popular order_number nos pedidos existentes que não têm
UPDATE orders
SET order_number = 'LV-' || LPAD(nextval('orders_order_number_seq')::TEXT, 5, '0')
WHERE order_number IS NULL;

-- Tornar order_number NOT NULL com default automático após popular
ALTER TABLE orders
  ALTER COLUMN order_number SET DEFAULT 'LV-' || LPAD(nextval('orders_order_number_seq')::TEXT, 5, '0');

-- 4. Corrigir CHECK constraint de payment_method para incluir boleto
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('pix', 'credit_card', 'boleto'));

-- 5. Índice no user_id para consultas de pedidos por usuário
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- 6. Política RLS: usuário logado pode ver seus próprios pedidos por user_id
DROP POLICY IF EXISTS "Allow customers to view their orders" ON orders;

CREATE POLICY "Allow customers to view their orders" ON orders
  FOR SELECT USING (
    customer_email = current_setting('app.customer_email', true)
    OR user_id = auth.uid()
  );

-- 7. Política para service_role inserir/atualizar (Edge Functions usam service role)
CREATE POLICY IF NOT EXISTS "Service role full access on orders" ON orders
  USING (true)
  WITH CHECK (true);
