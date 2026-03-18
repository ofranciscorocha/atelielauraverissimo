# 🗄️ Como Criar o Banco de Dados no Supabase

## ✅ STATUS ATUAL DO DEPLOY

**Site está NO AR:** https://atelier-aura.vercel.app/

✅ Todas variáveis de ambiente configuradas na Vercel
✅ Integração Melhor Envio configurada
✅ Integração Mercado Pago configurada
✅ Deploy funcionando

⚠️ **FALTA APENAS:** Criar as tabelas no banco de dados

---

## 📝 PASSO A PASSO - 5 MINUTOS

### 1️⃣ Acesse o Supabase

**Link direto:** https://supabase.com/dashboard/project/syilqqtgphpqdamvvazn/editor

ou

1. Acesse: https://supabase.com/dashboard
2. Clique no projeto: **syilqqtgphpqdamvvazn**
3. No menu lateral, clique em **SQL Editor**

---

### 2️⃣ Abra o Arquivo SQL

No seu projeto local, abra o arquivo:
```
CREATE_TABLES.sql
```

Este arquivo contém TODO o script necessário para criar:
- ✅ 13 Enums (tipos personalizados)
- ✅ 21 Tabelas
- ✅ Todos os índices
- ✅ Todas as foreign keys
- ✅ Dados iniciais (configuração padrão)

---

### 3️⃣ Execute o Script

1. No **SQL Editor** do Supabase, clique em **New query**
2. **Copie TODO o conteúdo** do arquivo `CREATE_TABLES.sql`
3. **Cole** no editor SQL
4. Clique no botão **RUN** (ou pressione Ctrl+Enter)

⏱️ **Tempo de execução:** ~5-10 segundos

---

### 4️⃣ Verifique se Funcionou

Após executar, você deve ver:

✅ Mensagem de sucesso: **"Success. No rows returned"**

Para confirmar que as tabelas foram criadas:

1. No menu lateral do Supabase, clique em **Table Editor**
2. Você deve ver TODAS estas tabelas:
   - Client
   - Product
   - ProductVariant
   - Order
   - OrderItem
   - Supplier
   - Supply
   - StockMovement
   - FinanceEntry
   - MarketingLog
   - AIGeneratedArt
   - ProductionEvent
   - Settings
   - User
   - Session
   - Message
   - Payment

---

### 5️⃣ Teste o Site

Após criar as tabelas, acesse:

**https://atelier-aura.vercel.app/**

Agora você pode:
1. ✅ Navegar pelo site sem erros
2. ✅ Ver a página de produtos
3. ✅ Adicionar produtos ao carrinho
4. ✅ Calcular frete real via Melhor Envio
5. ✅ Finalizar compra com Mercado Pago

---

## 🎨 Próximos Passos (Opcional)

### Adicionar Produtos de Exemplo

Se quiser adicionar produtos de exemplo para testar:

1. Acesse: https://atelier-aura.vercel.app/admin
2. Faça login (se houver sistema de login configurado)
3. Vá em **Produtos** e cadastre algumas taças

OU

Crie um script SQL para inserir produtos de exemplo (posso criar isso para você!)

---

## 🆘 Se Algo Der Errado

### Erro: "relation already exists"

Se você já executou o script antes e deu erro, execute este comando ANTES de rodar o CREATE_TABLES.sql:

```sql
-- ATENÇÃO: Isso vai DELETAR TODAS as tabelas e dados!
-- Use apenas se precisar recomeçar do zero

DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "Message" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Settings" CASCADE;
DROP TABLE IF EXISTS "ProductionEvent" CASCADE;
DROP TABLE IF EXISTS "AIGeneratedArt" CASCADE;
DROP TABLE IF EXISTS "MarketingLog" CASCADE;
DROP TABLE IF EXISTS "FinanceEntry" CASCADE;
DROP TABLE IF EXISTS "StockMovement" CASCADE;
DROP TABLE IF EXISTS "Supply" CASCADE;
DROP TABLE IF EXISTS "Supplier" CASCADE;
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "ProductVariant" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Client" CASCADE;

DROP TYPE IF EXISTS "PaymentStatus";
DROP TYPE IF EXISTS "PaymentMethod";
DROP TYPE IF EXISTS "SenderType";
DROP TYPE IF EXISTS "EventType";
DROP TYPE IF EXISTS "MessageStatus";
DROP TYPE IF EXISTS "MarketingChannel";
DROP TYPE IF EXISTS "FinanceType";
DROP TYPE IF EXISTS "MovementType";
DROP TYPE IF EXISTS "SupplyCategory";
DROP TYPE IF EXISTS "ProductionStatus";
DROP TYPE IF EXISTS "OrderStatus";
DROP TYPE IF EXISTS "ClientSegment";
DROP TYPE IF EXISTS "ClientRanking";
```

---

## ✅ CHECKLIST FINAL

Após executar o script SQL:

- [ ] Script executado com sucesso no Supabase
- [ ] 21 tabelas criadas e visíveis no Table Editor
- [ ] Site https://atelier-aura.vercel.app/ acessível sem erros
- [ ] Página de produtos carrega (mesmo vazia)
- [ ] Página admin carrega (mesmo sem produtos)

---

## 🎉 TUDO PRONTO!

Quando todas as tabelas estiverem criadas, o sistema estará **100% funcional** com:

✅ E-commerce completo
✅ Cálculo de frete real (Melhor Envio)
✅ Pagamento via PIX e Cartão (Mercado Pago)
✅ Sistema de gestão de pedidos
✅ CRM de clientes
✅ Controle de estoque
✅ Painel administrativo completo

**Qualquer dúvida, me avise!** 🚀
