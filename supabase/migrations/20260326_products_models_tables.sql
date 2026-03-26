-- =============================================================
-- Tabelas de Produtos e Modelos
-- 2026-03-26
-- =============================================================

-- Tabela de Modelos (taças e estilos de arte)
CREATE TABLE IF NOT EXISTS product_models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT,
  model_category TEXT CHECK (model_category IN ('tacas', 'arte')),
  capacity_variants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  technique TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT '',
  model_id TEXT REFERENCES product_models(id) ON DELETE SET NULL,
  collection_id TEXT,
  image TEXT NOT NULL DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  stock INT NOT NULL DEFAULT 0,
  launch_date TIMESTAMPTZ,
  sales_count INT NOT NULL DEFAULT 0,
  colors JSONB DEFAULT '[]'::jsonb,
  reviews JSONB DEFAULT '[]'::jsonb,
  observations TEXT,
  variants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE product_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Leitura pública
CREATE POLICY "Public read product_models" ON product_models
  FOR SELECT USING (true);

CREATE POLICY "Public read products" ON products
  FOR SELECT USING (true);

-- Escrita: apenas usuários autenticados (admin usa conta autenticada)
CREATE POLICY "Authenticated write product_models" ON product_models
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated write products" ON products
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Service role bypass (Edge Functions)
CREATE POLICY "Service role product_models" ON product_models
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role products" ON products
  FOR ALL USING (auth.role() = 'service_role');

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_model_id ON products(model_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);

-- Seed: Modelos iniciais
INSERT INTO product_models (id, name, image, model_category, capacity_variants) VALUES
  ('gin-600', 'Taça de Cristal Gin', 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a', 'tacas',
    '[{"id":"600ml","label":"600ml","priceAdjust":0,"stock":15,"inStock":true}]'),
  ('vinho', 'Taça de Cristal Vinho', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3', 'tacas',
    '[{"id":"450ml","label":"450ml","priceAdjust":0,"stock":12,"inStock":true},{"id":"650ml","label":"650ml","priceAdjust":50,"stock":8,"inStock":true}]'),
  ('shot-60', 'Copo de Cristal Shot', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b', 'tacas',
    '[{"id":"60ml","label":"60ml","priceAdjust":0,"stock":20,"inStock":true}]'),
  ('champagne-220', 'Taça de Cristal Champagne', 'https://images.unsplash.com/photo-1592318718033-5730d72ad78c', 'tacas',
    '[{"id":"220ml","label":"220ml","priceAdjust":0,"stock":10,"inStock":true}]'),
  ('coupe-220', 'Taça de Cristal Coupe', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b', 'tacas',
    '[{"id":"220ml","label":"220ml","priceAdjust":0,"stock":10,"inStock":true}]'),
  ('pintura-floral', 'Pintura Floral', 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2', 'arte',
    '[]'),
  ('pintura-geometrica', 'Pintura Geométrica', 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c', 'arte',
    '[]'),
  ('personalizar', 'Crie sua Taça', 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2', 'arte',
    '[]')
ON CONFLICT (id) DO NOTHING;

-- Seed: Produto inicial
INSERT INTO products (id, name, description, technique, price, category, model_id, image, images, in_stock, stock, sales_count) VALUES
  ('custom-order', 'Crie sua Própria Taça',
    'Personalize sua peça com cores, iniciais e desenhos exclusivos. Uma obra de arte feita sob medida para você.',
    'Personalização Artesanal', 350, 'Crie sua Taça', 'personalizar',
    'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&h=800&fit=crop',
    '["https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&h=800&fit=crop"]',
    true, 999, 150)
ON CONFLICT (id) DO NOTHING;
