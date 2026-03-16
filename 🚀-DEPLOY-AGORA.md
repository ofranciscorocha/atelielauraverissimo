# 🚀 DEPLOY AGORA - Laura Veríssimo Atelier

## ✅ O QUE JÁ ESTÁ PRONTO

- ✅ Código completo commitado e enviado para GitHub
- ✅ Vercel já está fazendo deploy automático (pode levar 2-5 minutos)
- ✅ Prisma schema atualizado com User, Session, Message, Payment
- ✅ Server Actions completas (auth, messages, payments, orders)
- ✅ Página de Perfil com Pedidos + Chat + Dados
- ✅ Documentação completa

## ⚠️ AÇÕES NECESSÁRIAS (3 PASSOS SIMPLES)

### 🗄️ PASSO 1: Criar Tabelas no Supabase (2 minutos)

1. Abra: https://supabase.com/dashboard/project/syilqqtgphpqdamvvazn/sql/new

2. Abra o arquivo `manual-migration.sql` neste projeto

3. **Copie TODO o conteúdo** do arquivo

4. **Cole** no SQL Editor do Supabase

5. Clique em **"Run"**

6. Você verá a mensagem: `Migration completed successfully!`

**Pronto!** As 4 novas tabelas foram criadas:
- ✅ User
- ✅ Session
- ✅ Message
- ✅ Payment

---

### 📦 PASSO 2: Instalar Dependências (1 minuto)

Abra o terminal neste projeto e execute:

```bash
npm install bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

**Aguarde a instalação** (pode levar ~30 segundos).

---

### 🎨 PASSO 3: Deploy Final (Automático!)

Após instalar as dependências, commit e push:

```bash
git add package.json package-lock.json
git commit -m "deps: Add bcryptjs and jsonwebtoken"
git push origin main
```

**Pronto!** O Vercel fará o deploy final automaticamente.

---

## 🎯 TESTANDO O SISTEMA

### Aguarde o Deploy Finalizar

Acesse: https://vercel.com/ofranciscorochas-projects/laura-verissimo-atelier

Quando o status estiver **"Ready"**, o sistema estará no ar.

### URLs Principais:

- **Homepage**: https://seu-dominio.vercel.app
- **Produtos**: https://seu-dominio.vercel.app/produtos
- **Checkout**: https://seu-dominio.vercel.app/checkout
- **Perfil**: https://seu-dominio.vercel.app/perfil

---

## 🧪 COMO TESTAR

### Teste 1: Navegação Básica
1. Acesse a homepage
2. Navegue pelos produtos
3. Adicione algum produto ao carrinho
4. Vá para o checkout

### Teste 2: Login/Registro (PENDENTE)
⚠️ **NOTA**: Você ainda precisará criar as páginas de login e registro.

Por enquanto, você pode:
- Criar um usuário manualmente no Supabase SQL Editor:
```sql
INSERT INTO "User" (id, "createdAt", "updatedAt", email, "passwordHash", name)
VALUES (
  'clxxxxxxxxxxxxxxx', -- ID gerado
  NOW(),
  NOW(),
  'teste@lauraverissimo.com',
  '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', -- Hash de senha
  'Cliente Teste'
);
```

### Teste 3: Perfil do Cliente
1. Faça login (quando implementar as páginas)
2. Acesse `/perfil`
3. Veja suas 3 abas:
   - **Meus Pedidos** (vazio inicialmente)
   - **Chat com Ateliê** (envie uma mensagem!)
   - **Meus Dados** (suas informações)

### Teste 4: Fluxo Completo de Pedido
1. Adicione produtos ao carrinho
2. Vá para checkout
3. Preencha os dados
4. **Quando implementar**: Sistema criará pedido → pagamento → redireciona MP
5. Acesse `/perfil` para ver o pedido

---

## 📋 O QUE AINDA PRECISA SER IMPLEMENTADO

### 🔐 Páginas de Autenticação (PRÓXIMO PASSO)

Você precisará criar:

#### `src/app/login/page.tsx`
Página de login com:
- Input de email
- Input de senha
- Botão "Entrar"
- Link para "/registro"
- Chamada para `loginUser()` do `auth.actions.ts`

#### `src/app/registro/page.tsx`
Página de cadastro com:
- Input de nome
- Input de email
- Input de senha
- Botão "Criar Conta"
- Link para "/login"
- Chamada para `registerUser()` do `auth.actions.ts`

**Exemplo Rápido de Login Page**:
```tsx
'use client'
import { useState } from 'react'
import { loginUser } from '@/lib/actions/auth.actions'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await loginUser({ email, password })
    if (result.success) {
      router.push('/perfil')
    } else {
      alert(result.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
        />
        <button className="w-full bg-[#304930] text-white py-3 rounded hover:bg-[#456745]">
          Entrar
        </button>
      </form>
    </div>
  )
}
```

### 🛒 Atualização do Checkout

Você precisará modificar `src/app/checkout/page.tsx` para:

1. Verificar se usuário está logado antes de processar
2. Criar pedido usando `createOrder()`
3. Criar pagamento usando `createPayment()`
4. Então redirecionar para Mercado Pago

**Instruções detalhadas** estão em `SISTEMA-COMPLETO-README.md`, seção "Passo 4".

---

## 🆘 PROBLEMAS COMUNS

### ❌ "Error: table does not exist"
**Causa**: SQL não foi executado no Supabase
**Solução**: Execute o PASSO 1 acima

### ❌ "Cannot find module 'bcryptjs'"
**Causa**: Dependências não instaladas
**Solução**: Execute o PASSO 2 acima

### ❌ Build falha no Vercel
**Causa**: Dependências faltando no package.json
**Solução**:
```bash
npm install bcryptjs jsonwebtoken
git add package.json package-lock.json
git commit -m "deps: Add missing dependencies"
git push
```

### ❌ "NEXTAUTH_SECRET não definido"
**Causa**: Variável de ambiente faltando
**Solução**:
1. Acesse Vercel Dashboard → Seu Projeto → Settings → Environment Variables
2. Adicione:
   - **Nome**: `NEXTAUTH_SECRET`
   - **Valor**: (qualquer string aleatória longa, exemplo: `kwxRVED7HJfy2Frb+8cXeuBlapejAsQmNmizulvnODDk=`)
3. Redeploy

---

## 📊 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Já Funcionando:
- Navegação de produtos
- Carrinho de compras
- Cálculo de frete (Melhor Envio)
- Página de Perfil com 3 abas
- Sistema de Chat (sem login ainda)
- Rastreamento de pedidos
- Status de produção
- Rankings VIP automáticos

### ⏳ Precisa de Login para Funcionar:
- Criação de pedidos
- Visualização de pedidos no perfil
- Chat personalizado
- Estatísticas pessoais

---

## 🎉 PRÓXIMA SESSÃO: IMPLEMENTAR LOGIN/REGISTRO

Na próxima sessão, podemos:
1. Criar páginas de login e registro bonitas
2. Integrar com o checkout
3. Testar fluxo completo de pedido
4. Adicionar proteção de rotas
5. Implementar "Esqueci minha senha"

---

## 📞 NEED HELP?

Se encontrar qualquer problema:
1. Leia `SISTEMA-COMPLETO-README.md` para detalhes técnicos
2. Verifique `DATABASE-SETUP.md` para setup do banco
3. Revise os logs do Vercel em: https://vercel.com/ofranciscorochas-projects/laura-verissimo-atelier/logs

---

**Status Atual**: ✅ Backend 100% completo | ⏳ Frontend de login pendente

**Última atualização**: 16 de Março de 2026
