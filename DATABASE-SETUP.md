# 🗄️ Database Setup - Laura Veríssimo Atelier

## ⚠️ IMPORTANTE: Execute este SQL no Supabase ANTES de usar o sistema

O schema Prisma foi atualizado com novos modelos para:
- ✅ **User** - Autenticação de usuários
- ✅ **Session** - Sessões de login
- ✅ **Message** - Chat entre clientes e ateliê
- ✅ **Payment** - Rastreamento de pagamentos

## 📋 Passo a Passo

### 1. Acesse o Supabase SQL Editor

Acesse: https://supabase.com/dashboard/project/syilqqtgphpqdamvvazn/sql/new

### 2. Cole e Execute o SQL

Copie todo o conteúdo do arquivo `manual-migration.sql` e execute no SQL Editor.

### 3. Verifique a Criação das Tabelas

Após executar, verifique se as tabelas foram criadas:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('User', 'Session', 'Message', 'Payment');
```

Você deve ver 4 linhas retornadas.

### 4. Pronto!

Após executar o SQL, o sistema estará pronto para:
- ✅ Registrar usuários
- ✅ Salvar pedidos no checkout
- ✅ Rastrear pagamentos
- ✅ Chat em tempo real entre clientes e ateliê
- ✅ Perfil de usuário com histórico de pedidos

## 🔄 Próximos Passos Após Setup

1. Faça deploy do código no Vercel (push para GitHub)
2. Teste o fluxo completo:
   - Cadastro de usuário
   - Adicionar produtos ao carrinho
   - Finalizar pedido (checkout)
   - Ver pedido no perfil
   - Trocar mensagens no chat

## 🆘 Problemas?

Se encontrar erro "table already exists", está tudo OK! As tabelas já foram criadas.

Se encontrar erro de permissão, verifique se está usando o usuário correto do Supabase.

## 📊 Schema Completo

O sistema agora possui:
- **16 modelos principais**
- **10 enums**
- **User + Session** para autenticação
- **Message** para chat
- **Payment** para rastreamento de pagamentos
- **Order** com status de produção granular
- **Client** com ranking VIP automático

