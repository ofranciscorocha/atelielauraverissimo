-- Manual Migration: Add User, Session, Message, Payment tables
-- Generated from Prisma schema updates

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "clientId" TEXT UNIQUE,
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- Create Session table
CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL UNIQUE,
  "expires" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "Session_sessionToken_idx" ON "Session"("sessionToken");

-- Create SenderType enum
DO $$ BEGIN
  CREATE TYPE "SenderType" AS ENUM ('CUSTOMER', 'ADMIN', 'SYSTEM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create Message table
CREATE TABLE IF NOT EXISTS "Message" (
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
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "Message_userId_idx" ON "Message"("userId");
CREATE INDEX IF NOT EXISTS "Message_orderId_idx" ON "Message"("orderId");
CREATE INDEX IF NOT EXISTS "Message_createdAt_idx" ON "Message"("createdAt");

-- Create PaymentMethod enum
DO $$ BEGIN
  CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'MERCADO_PAGO', 'TRANSFERENCIA', 'DINHEIRO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create PaymentStatus enum
DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('PENDENTE', 'APROVADO', 'RECUSADO', 'CANCELADO', 'ESTORNADO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create Payment table
CREATE TABLE IF NOT EXISTS "Payment" (
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
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS "Payment_orderId_idx" ON "Payment"("orderId");
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");
CREATE INDEX IF NOT EXISTS "Payment_externalId_idx" ON "Payment"("externalId");

-- Success message
SELECT 'Migration completed successfully!' as result;
