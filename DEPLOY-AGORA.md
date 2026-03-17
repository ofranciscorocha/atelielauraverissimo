# 🚀 CONFIGURAÇÃO FINAL - DEPLOY AGORA!

## ⚡ Passos RÁPIDOS (10 minutos)

---

## 1️⃣ ACESSE O VERCEL

👉 **Link direto:** https://vercel.com/ofranciscorochas-projects/laura-verissimo-atelier/settings/environment-variables

---

## 2️⃣ ADICIONE AS 12 VARIÁVEIS

Clique em **"Add New"** e copie/cole cada uma:

### ✅ BANCO DE DADOS (2 variáveis)

**DATABASE_URL:**
```
postgresql://postgres:kHiGKiKbJfIwknnd@db.syilqqtgphpqdamvvazn.supabase.co:5432/postgres
```

**DIRECT_URL:**
```
postgresql://postgres:kHiGKiKbJfIwknnd@db.syilqqtgphpqdamvvazn.supabase.co:5432/postgres
```

---

### ✅ SUPABASE (1 variável)

**NEXT_PUBLIC_SUPABASE_ANON_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aWxxcXRncGhwcWRhbXZ2YXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTM5NDYsImV4cCI6MjA4OTA2OTk0Nn0.dWghk-vlNw688rPtRq9yoAUlAYHzUmwXG5cW8Ic3OQ8
```

---

### ✅ AUTENTICAÇÃO (1 variável)

**JWT_SECRET:**
```
rocha-zap-secret-key-2026-secure-v1
```

---

### ✅ WHATSAPP (1 variável)

**NEXT_PUBLIC_WHATSAPP_NUMBER:**
```
5524992982442
```

---

### ✅ MELHOR ENVIO - FRETE (3 variáveis)

**MELHOR_ENVIO_TOKEN:**
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZjA0MGNhZTE3NGUyN2ZlZGVmNGY3ZGE4NmU3NzA2MGQ2MTBjNmFmNGI4NWEwMTMyOWM1ZmQ2YzFlODlhNDQ3NGU1OWFlY2U0NzFlNzllOTciLCJpYXQiOjE3NzM3MTA2NjUuOTM4MzIxLCJuYmYiOjE3NzM3MTA2NjUuOTM4MzIyLCJleHAiOjE4MDUyNDY2NjUuOTI3NDAyLCJzdWIiOiJhMTRkMjAzZS1iMDljLTQ3NjUtOWQxNi1iZGM2NjI1OWFjY2UiLCJzY29wZXMiOlsic2hpcHBpbmctY2FsY3VsYXRlIl19.I96SaZvO7B9DTlaNiAFjGnsKX7XVfZ8ep6v5-SmclzZpJrCRpYD5CB9WAuYnAU0BW335KAfLUfR1Pa3oylrOjnckJiKQskyAKlx4CU9hJPhzMOr50yrxZD_aPtvHWR_wdMutQqMZ0os_IBpO92-9HIoEq5NqQiV7eVbHm5m4pwnks75m-c9K2Op9-2UEoYV4qugqeBRJ0IMQ6Epr5fWR9rq3KF6ksxBcqNzRpc5cCRp3ZcZrntf-wz1mddoPjXmv_Y0W0xLq2hWI7FPX-b3hItGwbPfYuM_uMyC3JPcgmasycUOjR0nooZbhB6NPI4kLDBj9u6Qj31G3pRkdsLvMIxNM3pr7uJNaD4QKqqaPLoItWig3qWz58GfRBRAwIXlm9UY8LfXPnh1ue6MRAXlux4_uxWq48KjLjoCllSwoQ9LK9fhovBrCWmTcC8EQ_VA4m8zoZhY1cm3du0S2aQ0AJn3awDHduYEa5oy8tUgKlSme0uCtnBkitxXb6Ez8BA3hdRWusg-ztnaQcd5SNf0fcmkm7EkvudooNSi5lKgcvE83iRFViSJ-pW5qe2PzhuVCucXtYBNDpOB-RZBlyDiX5R_Gqxp6oizUUnnmrceSXIaq3hux84o_lal3QglNxdG-bnF4ptcQ4tD9GBnKkZov40sz0HnSwG0HunaHMb7PWV0
```

**MELHOR_ENVIO_API_URL:**
```
https://melhorenvio.com.br/api/v2/me
```

**ORIGIN_POSTAL_CODE:**
```
44053-744
```

---

### ✅ MERCADO PAGO - PAGAMENTO (3 variáveis)

**MERCADO_PAGO_ACCESS_TOKEN:**
```
APP_USR-6624447637549364-031621-b9ed0dfeb480ba944b02a07396c913da-3267453961
```

**MERCADO_PAGO_PUBLIC_KEY:**
```
APP_USR-5e7b1b36-2318-4dee-be71-6bb729bde836
```

**NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY:**
```
APP_USR-5e7b1b36-2318-4dee-be71-6bb729bde836
```

---

### ✅ URL BASE (1 variável)

**NEXT_PUBLIC_BASE_URL:**
```
https://atelielauraverissimo.vercel.app
```

---

## 3️⃣ MARCAR ENVIRONMENTS

⚠️ **IMPORTANTE:** Para CADA variável, marque:
- ☑️ **Production**
- ☑️ **Preview**
- ☑️ **Development**

---

## 4️⃣ FAZER REDEPLOY

Depois de adicionar TODAS as 12 variáveis:

1. Vá em: https://vercel.com/ofranciscorochas-projects/laura-verissimo-atelier/deployments
2. Clique nos **3 pontinhos** do último deploy
3. Clique em **"Redeploy"**
4. ✅ **Aguarde 3 minutos**

---

## 5️⃣ TESTAR

Após o deploy:

1. Acesse: https://atelielauraverissimo.vercel.app
2. Adicione uma taça no carrinho
3. Vá para o checkout
4. Calcule frete com CEP de São Paulo: **01310-100**
5. Deve mostrar opções REAIS: PAC, SEDEX, etc.
6. Finalize - deve gerar link do Mercado Pago

---

## ✅ CHECKLIST FINAL

- [ ] 12 variáveis adicionadas no Vercel
- [ ] Todas marcadas como Production
- [ ] Redeploy feito
- [ ] Site testado com CEP de São Paulo
- [ ] Link de pagamento do Mercado Pago gerado

---

## 🎉 QUANDO TUDO FUNCIONAR:

**Sua cliente de São Paulo poderá:**
1. ✅ Ver o catálogo de taças
2. ✅ Adicionar ao carrinho
3. ✅ Calcular frete REAL para São Paulo
4. ✅ Pagar com PIX ou Cartão (até 12x)
5. ✅ Receber confirmação automática
6. ✅ Você recebe notificação do pedido

---

**🚀 VAI DAR CERTO! Me avise quando terminar de configurar!**
