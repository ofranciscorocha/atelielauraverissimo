# 🚀 INICIAR PROJETO AGORA - 5 Passos Simples

## ✅ O QUE JÁ ESTÁ PRONTO:

- ✅ Backend completo (Supabase Edge Functions)
- ✅ Integração Mercado Pago
- ✅ Sistema de pedidos (banco de dados)
- ✅ Checkout atualizado
- ✅ Documentação completa

---

## 📋 PASSOS PARA INICIAR

### 1️⃣ Instalar Dependências (NO TERMINAL)

```bash
cd d:\PROJETOS-ROCHINHA\PROJETOS\atelier-aura-lovable

# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

**Aguarde terminar** (pode demorar 2-5 minutos)

---

### 2️⃣ Iniciar Servidor Local

```bash
npm run dev
```

**Deverá aparecer:**
```
VITE v5.x.x ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### 3️⃣ Abrir no Navegador

```
http://localhost:5173
```

---

## 🎯 O QUE VOCÊ VAI VER:

- ✅ Site Laura Veríssimo funcionando
- ✅ Galeria de produtos
- ✅ Carrinho de compras
- ✅ Checkout (MAS o pagamento ainda não funciona sem configurar)

---

## ⚠️ IMPORTANTE: Mercado Pago NÃO vai funcionar ainda!

**Por quê?**
Você precisa:
1. Criar conta no Mercado Pago
2. Configurar credenciais
3. Deploy das Edge Functions no Supabase

**Mas você pode testar o site localmente sem problemas!**

---

## 🔧 PRÓXIMOS PASSOS (Depois de testar localmente):

### 1. Criar Conta Mercado Pago
- https://www.mercadopago.com.br/developers
- Criar aplicativo
- Copiar **Access Token**

### 2. Configurar Supabase
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Linkar projeto
supabase link --project-ref lkaxvbpvxcchkhuzcgvt

# Executar migration
supabase db push

# Deploy Edge Functions
supabase functions deploy create-order
supabase functions deploy mercadopago-webhook

# Configurar secret
supabase secrets set MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
```

### 3. Deploy no Vercel
```bash
vercel --prod
```

---

## 📚 DOCUMENTAÇÃO COMPLETA:

📄 **[LEIA-ME-PRIMEIRO.md](./LEIA-ME-PRIMEIRO.md)** - Visão geral
📄 **[MERCADOPAGO-INTEGRATION.md](./MERCADOPAGO-INTEGRATION.md)** - Detalhes técnicos

---

## 🆘 PROBLEMAS COMUNS:

### "npm install" está demorando muito
➡️ Normal! Pode demorar 5-10 minutos na primeira vez

### "vite: command not found"
➡️ Execute: `rm -rf node_modules && npm install`

### Site não abre no navegador
➡️ Verifique se o servidor está rodando
➡️ Tente `http://127.0.0.1:5173`

### Checkout não funciona
➡️ Normal! Precisa configurar Mercado Pago primeiro (veja acima)

---

## 🎨 LAYOUT ORIGINAL PRESERVADO

**Nenhuma mudança visual!**
Apenas a funcionalidade foi atualizada.

---

**Pronto! Agora é só seguir os 3 passos acima e testar! 🚀**
