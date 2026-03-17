-- LAURA VERISSIMO ATELIER - SQL PARA CRIAR TABELAS NO SUPABASE
-- Execute este script no SQL Editor do Supabase: https://supabase.com/dashboard/project/syilqqtgphpqdamvvazn

-- ========================================
-- ENUMS
-- ========================================

CREATE TYPE "ClientRanking" AS ENUM ('NOVO', 'BRONZE', 'PRATA', 'OURO', 'PLATINA', 'VIP');
CREATE TYPE "ClientSegment" AS ENUM ('POTENCIAL', 'RECORRENTE', 'EM_RISCO', 'INATIVO', 'CHAMPION');
CREATE TYPE "OrderStatus" AS ENUM ('AGUARDANDO_PAGAMENTO', 'PAGO', 'EM_PRODUCAO', 'PRONTO_PARA_ENVIO', 'ENVIADO', 'ENTREGUE', 'CANCELADO');
CREATE TYPE "ProductionStatus" AS ENUM ('NAO_INICIADO', 'PREPARO', 'PINTURA', 'CURA', 'INSPECAO', 'ACABAMENTO', 'EMBALAGEM', 'CONCLUIDO');
CREATE TYPE "SupplyCategory" AS ENUM ('CRISTAL', 'TINTA', 'PINCEL', 'EMBALAGEM', 'ACESSORIO', 'OUTRO');
CREATE TYPE "MovementType" AS ENUM ('ENTRADA', 'SAIDA_PRODUCAO', 'AJUSTE', 'PERDA');
CREATE TYPE "FinanceType" AS ENUM ('RECEITA', 'DESPESA');
CREATE TYPE "MarketingChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'SMS');
CREATE TYPE "MessageStatus" AS ENUM ('ENVIADO', 'ENTREGUE', 'ABERTO', 'CLICADO', 'ERRO');
CREATE TYPE "EventType" AS ENUM ('PRODUCAO', 'ENTREGA', 'FEIRA', 'OUTRO');
CREATE TYPE "SenderType" AS ENUM ('CUSTOMER', 'ADMIN', 'SYSTEM');
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'MERCADO_PAGO', 'TRANSFERENCIA', 'DINHEIRO');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDENTE', 'APROVADO', 'RECUSADO', 'CANCELADO', 'ESTORNADO');

-- ========================================
-- TABELAS
-- ========================================

-- Client
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "phone" TEXT NOT NULL,
    "cpf" TEXT UNIQUE,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "ranking" "ClientRanking" NOT NULL DEFAULT 'NOVO',
    "lifetimeValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "averageTicket" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lastPurchaseAt" TIMESTAMP(3),
    "segment" "ClientSegment" NOT NULL DEFAULT 'POTENCIAL',
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "styleVibe" TEXT,
    "emailOptIn" BOOLEAN NOT NULL DEFAULT true,
    "whatsappOptIn" BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX "Client_ranking_idx" ON "Client"("ranking");
CREATE INDEX "Client_segment_idx" ON "Client"("segment");
CREATE INDEX "Client_email_idx" ON "Client"("email");

-- Product
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "slug" TEXT NOT NULL UNIQUE,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[]
);

CREATE INDEX "Product_slug_idx" ON "Product"("slug");
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- ProductVariant
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "capacity" TEXT NOT NULL,
    "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "stockQty" INTEGER NOT NULL DEFAULT 0,
    "priceAdjust" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "sku" TEXT NOT NULL UNIQUE,
    CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);

CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");
CREATE INDEX "ProductVariant_sku_idx" ON "ProductVariant"("sku");

-- Order
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
    "productionStatus" "ProductionStatus" NOT NULL DEFAULT 'NAO_INICIADO',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "shippingFee" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "estimatedProductionDays" INTEGER NOT NULL,
    "estimatedDeliveryDate" TIMESTAMP(3),
    "shippingTrackingCode" TEXT,
    "specialMessage" TEXT,
    "internalNotes" TEXT,
    CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id")
);

CREATE INDEX "Order_clientId_idx" ON "Order"("clientId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_productionStatus_idx" ON "Order"("productionStatus");

-- OrderItem
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id"),
    CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id")
);

CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- Supplier
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "whatsappUrl" TEXT,
    "qualityRating" INTEGER NOT NULL DEFAULT 3,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 7
);

CREATE INDEX "Supplier_qualityRating_idx" ON "Supplier"("qualityRating");

-- Supply
CREATE TABLE "Supply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "category" "SupplyCategory" NOT NULL,
    "sku" TEXT NOT NULL UNIQUE,
    "supplierId" TEXT,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "minStockLevel" INTEGER NOT NULL DEFAULT 10,
    "unit" TEXT NOT NULL,
    "unitCost" DECIMAL(10,2) NOT NULL,
    "isLowStock" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Supply_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id")
);

CREATE INDEX "Supply_category_idx" ON "Supply"("category");
CREATE INDEX "Supply_isLowStock_idx" ON "Supply"("isLowStock");

-- StockMovement
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supplyId" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "orderId" TEXT,
    "supplierId" TEXT,
    "notes" TEXT,
    CONSTRAINT "StockMovement_supplyId_fkey" FOREIGN KEY ("supplyId") REFERENCES "Supply"("id"),
    CONSTRAINT "StockMovement_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id")
);

CREATE INDEX "StockMovement_supplyId_idx" ON "StockMovement"("supplyId");
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");
CREATE INDEX "StockMovement_type_idx" ON "StockMovement"("type");

-- FinanceEntry
CREATE TABLE "FinanceEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "FinanceType" NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "orderId" TEXT UNIQUE,
    "costOfGoods" DECIMAL(10,2),
    "profit" DECIMAL(10,2),
    CONSTRAINT "FinanceEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id")
);

CREATE INDEX "FinanceEntry_type_idx" ON "FinanceEntry"("type");
CREATE INDEX "FinanceEntry_createdAt_idx" ON "FinanceEntry"("createdAt");

-- MarketingLog
CREATE TABLE "MarketingLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT NOT NULL,
    "channel" "MarketingChannel" NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'ENVIADO',
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    CONSTRAINT "MarketingLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id")
);

CREATE INDEX "MarketingLog_clientId_idx" ON "MarketingLog"("clientId");
CREATE INDEX "MarketingLog_channel_idx" ON "MarketingLog"("channel");
CREATE INDEX "MarketingLog_createdAt_idx" ON "MarketingLog"("createdAt");

-- AIGeneratedArt
CREATE TABLE "AIGeneratedArt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "originalPrompt" TEXT NOT NULL,
    "refinedPrompt" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageUrlNoWatermark" TEXT,
    "style" TEXT NOT NULL,
    "colors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "usedInProduct" BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX "AIGeneratedArt_createdAt_idx" ON "AIGeneratedArt"("createdAt");

-- ProductionEvent
CREATE TABLE "ProductionEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "eventType" "EventType" NOT NULL,
    "orderId" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX "ProductionEvent_date_idx" ON "ProductionEvent"("date");
CREATE INDEX "ProductionEvent_eventType_idx" ON "ProductionEvent"("eventType");

-- Settings
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#304930',
    "secondaryColor" TEXT NOT NULL DEFAULT '#F0F4F0',
    "accentColor" TEXT NOT NULL DEFAULT '#D4AF37',
    "bannersJson" TEXT NOT NULL DEFAULT '[]',
    "minProductionDays" INTEGER NOT NULL DEFAULT 7,
    "maxProductionDays" INTEGER NOT NULL DEFAULT 15,
    "shippingInfo" TEXT NOT NULL DEFAULT 'Frete fixo para todo o Brasil. Consulte condições.',
    "whatsappNumber" TEXT NOT NULL DEFAULT '5511999999999',
    "whatsappMessage" TEXT NOT NULL DEFAULT 'Olá! Gostaria de finalizar meu pedido 💚',
    "pixKey" TEXT,
    "pixName" TEXT,
    "openaiApiKey" TEXT
);

-- User
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientId" TEXT UNIQUE,
    CONSTRAINT "User_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id")
);

CREATE INDEX "User_email_idx" ON "User"("email");

-- Session
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL UNIQUE,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_sessionToken_idx" ON "Session"("sessionToken");

-- Message
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "senderType" "SenderType" NOT NULL,
    "senderName" TEXT NOT NULL,
    "orderId" TEXT,
    "content" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")
);

CREATE INDEX "Message_userId_idx" ON "Message"("userId");
CREATE INDEX "Message_orderId_idx" ON "Message"("orderId");
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- Payment
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL UNIQUE,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDENTE',
    "externalId" TEXT,
    "preferenceId" TEXT,
    "payerEmail" TEXT,
    "payerName" TEXT,
    "pixQrCode" TEXT,
    "pixKey" TEXT,
    "proofImageUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id")
);

CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
CREATE INDEX "Payment_externalId_idx" ON "Payment"("externalId");

-- ========================================
-- DADOS INICIAIS
-- ========================================

-- Inserir configuração padrão
INSERT INTO "Settings" ("id", "updatedAt")
VALUES ('default', CURRENT_TIMESTAMP);
