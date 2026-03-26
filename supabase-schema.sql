-- =====================================================
-- ATELIER LAURA VERISSIMO - SCHEMA COMPLETO
-- Sistema de E-commerce com Pedidos, Pagamentos e Chat
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABELA DE PERFIS DE USUÁRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  cpf_cnpj TEXT,
  is_vip BOOLEAN DEFAULT false,
  total_spent DECIMAL(10,2) DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABELA DE ENDEREÇOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  street TEXT NOT NULL,
  number TEXT,
  complement TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  cep TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABELA DE PEDIDOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Status do pedido
  status TEXT NOT NULL DEFAULT 'pendente_pagamento',
  -- Possíveis status:
  -- 'pendente_pagamento', 'pago', 'em_producao', 'pronto',
  -- 'em_transito', 'entregue', 'cancelado'

  -- Valores
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,

  -- Informações de entrega
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  shipping_address_id UUID REFERENCES public.addresses(id),
  shipping_method TEXT, -- Nome da transportadora/método
  shipping_days INTEGER, -- Prazo estimado em dias
  tracking_code TEXT,

  -- Informações adicionais
  is_gift BOOLEAN DEFAULT false,
  gift_message TEXT,
  notes TEXT,

  -- Controle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 4. TABELA DE ITENS DO PEDIDO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,

  product_id TEXT NOT NULL, -- ID do produto (pode ser do mock ou do Supabase)
  product_name TEXT NOT NULL,
  product_image TEXT,

  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,

  -- Customizações/Variantes
  variant_info JSONB, -- Ex: {"tamanho": "Grande", "cor": "Dourado"}

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABELA DE PAGAMENTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,

  -- Status do pagamento
  status TEXT NOT NULL DEFAULT 'pending',
  -- 'pending', 'approved', 'rejected', 'refunded', 'cancelled'

  -- Gateway de pagamento
  payment_method TEXT NOT NULL, -- 'mercadopago', 'pix', 'cartao', 'boleto'
  gateway TEXT DEFAULT 'mercadopago',

  -- IDs externos (Mercado Pago, etc)
  external_payment_id TEXT,
  external_preference_id TEXT,

  -- Valores
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',

  -- Dados adicionais
  payment_data JSONB, -- Dados completos da resposta do gateway
  payer_email TEXT,
  payer_name TEXT,

  -- Controle
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 6. TABELA DE MENSAGENS/CHAT
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  sender_type TEXT NOT NULL, -- 'customer' ou 'admin'
  message TEXT NOT NULL,

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,

  -- Anexos (imagens, docs)
  attachments JSONB, -- Array de URLs

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. TABELA DE HISTÓRICO DE STATUS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,

  old_status TEXT,
  new_status TEXT NOT NULL,

  changed_by UUID REFERENCES public.profiles(id),
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_messages_order_id ON public.messages(order_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Addresses
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios endereços"
  ON public.addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios endereços"
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios endereços"
  ON public.addresses FOR UPDATE
  USING (auth.uid() = user_id);

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios pedidos"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar pedidos"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver itens de seus pedidos"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver pagamentos de seus pedidos"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas mensagens"
  ON public.messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar mensagens"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 10. TRIGGERS
-- =====================================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Registrar mudanças de status
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_order_status_changes
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- Atualizar perfil do usuário quando pedido é pago
CREATE OR REPLACE FUNCTION update_user_stats_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pago' AND (OLD.status IS NULL OR OLD.status != 'pago') THEN
    UPDATE public.profiles
    SET
      total_spent = total_spent + NEW.total,
      order_count = order_count + 1,
      is_vip = (total_spent + NEW.total) >= 1000 -- VIP se gastar R$ 1000+
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_payment();

-- =====================================================
-- 11. FUNÇÕES ÚTEIS
-- =====================================================

-- Gerar número de pedido único
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = new_number);
    counter := counter + 1;
  END LOOP;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
