# 🎨 Ateliê Laura Veríssimo - Instalação do Schema Supabase

## 📋 Pré-requisitos

Você precisa ter uma conta no **Supabase** e o projeto já criado.

## 🚀 Como Instalar o Schema

### Passo 1: Acessar o Editor SQL do Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto **Laura Veríssimo Ateliê**
3. No menu lateral, clique em **"SQL Editor"**

### Passo 2: Executar o Script SQL

1. Clique em **"New Query"** (Nova Consulta)
2. Copie TODO o conteúdo do arquivo `supabase-schema.sql` (raiz do projeto)
3. Cole no editor SQL
4. Clique em **"RUN"** (Executar)

⚠️ **IMPORTANTE**: Execute o script completo de uma só vez! Ele contém:
- Criação de todas as tabelas
- Índices para performance
- Triggers automáticos
- Row Level Security (RLS)
- Funções úteis

### Passo 3: Verificar se Funcionou

Após executar, você deve ver no menu lateral **"Table Editor"** as seguintes tabelas:

✅ `profiles` - Perfis de usuários
✅ `addresses` - Endereços de entrega
✅ `orders` - Pedidos
✅ `order_items` - Itens dos pedidos
✅ `payments` - Pagamentos
✅ `messages` - Chat/Mensagens
✅ `order_status_history` - Histórico de status

### Passo 4: Criar Primeiro Perfil (Opcional)

Se quiser criar um perfil de teste, execute este SQL:

```sql
-- Inserir perfil de teste (substitua o UUID pelo seu ID de usuário do Supabase Auth)
INSERT INTO public.profiles (id, email, full_name, phone, is_vip)
VALUES (
  'UUID-DO-SEU-USUARIO', -- Substitua pelo seu ID
  'seu-email@example.com',
  'Laura Veríssimo',
  '(75) 99999-9999',
  true
);
```

**Como descobrir seu UUID de usuário:**
1. Vá em **Authentication** > **Users**
2. Copie o **UID** do seu usuário

## 📊 Estrutura das Tabelas

### `orders` (Pedidos)
- **Status possíveis:**
  - `pendente_pagamento` - Aguardando pagamento
  - `pago` - Pagamento confirmado
  - `em_producao` - Em produção
  - `pronto` - Pronto para envio
  - `em_transito` - Em trânsito
  - `entregue` - Entregue
  - `cancelado` - Cancelado

### `payments` (Pagamentos)
- **Status possíveis:**
  - `pending` - Pendente
  - `approved` - Aprovado
  - `rejected` - Rejeitado
  - `refunded` - Reembolsado
  - `cancelled` - Cancelado

### `messages` (Chat)
- **sender_type:**
  - `customer` - Cliente
  - `admin` - Admin (Laura)

## 🔐 Segurança (Row Level Security)

O schema já vem com **RLS habilitado** para:

- ✅ Usuários só podem ver seus próprios pedidos
- ✅ Usuários só podem ver suas próprias mensagens
- ✅ Usuários só podem criar seus próprios pedidos
- ✅ Admins têm acesso total (através de uma role especial)

## 🔄 Triggers Automáticos

O sistema conta com triggers que fazem automaticamente:

1. **Atualizar `updated_at`** - Sempre que um registro é atualizado
2. **Registrar mudanças de status** - Toda mudança de status do pedido é registrada
3. **Atualizar estatísticas do usuário** - Quando um pagamento é aprovado, o perfil do usuário é atualizado com:
   - Total gasto (`total_spent`)
   - Número de pedidos (`order_count`)
   - Status VIP (`is_vip`) - automático se gastar R$ 1.000+

## 🎯 Próximos Passos

Após instalar o schema:

1. ✅ O checkout já está integrado para criar pedidos
2. ✅ A página `/profile` mostra os pedidos do usuário
3. ✅ O chat funciona em tempo real
4. ⏳ Você precisará executar o seed de dados mockados (se quiser)

## 💡 Dicas

- Use o **Table Editor** do Supabase para visualizar os dados
- Use **SQL Editor** para queries personalizadas
- O **Database** > **Logs** mostra erros em tempo real
- Active o **Realtime** nas tabelas que precisar (como `messages`)

## 🆘 Problemas Comuns

### Erro: "relation already exists"
Se você já executou o script antes, algumas tabelas podem já existir. Você pode:
1. Deletar todas as tabelas manualmente
2. Ou modificar o script para usar `DROP TABLE IF EXISTS` antes de cada `CREATE TABLE`

### Erro: "permission denied"
Certifique-se de que você está executando como admin do projeto.

### RLS bloqueando acesso
Se você não conseguir acessar dados, verifique se:
- O usuário está autenticado
- O `user_id` nos registros corresponde ao `auth.uid()`

---

**🎨 Pronto! Seu banco de dados está configurado e pronto para receber pedidos!**
