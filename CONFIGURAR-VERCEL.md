# ⚙️ Configurar Variáveis de Ambiente no Vercel

## 🚨 URGENTE: Configure AGORA para o site funcionar

O deploy falhou porque faltam variáveis de ambiente. Siga os passos abaixo:

---

## 📋 Passo a Passo:

### 1. Acesse o Painel Vercel
- Vá em: https://vercel.com/ofranciscorochas-projects/laura-verissimo-atelier
- Clique em **"Settings"** (Configurações)
- Clique em **"Environment Variables"** no menu lateral

### 2. Adicione TODAS as variáveis abaixo:

Clique em **"Add New"** para cada uma e cole os valores exatamente como estão:

---

#### **DATABASE_URL**
```
postgresql://postgres.cvfvyhlwfcenwspmlxdp:Vizm9iIiUQuDcDsh@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```
- Environment: **Production, Preview, Development** (marcar TODOS)

---

#### **DIRECT_URL**
```
postgresql://postgres.cvfvyhlwfcenwspmlxdp:Vizm9iIiUQuDcDsh@aws-0-us-west-2.pooler.supabase.com:5432/postgres
```
- Environment: **Production, Preview, Development**

---

#### **JWT_SECRET**
```
rocha-zap-secret-key-2026-secure-v1
```
- Environment: **Production, Preview, Development**

---

#### **NEXT_PUBLIC_WHATSAPP_NUMBER**
```
5524992982442
```
- Environment: **Production, Preview, Development**

---

#### **MELHOR_ENVIO_TOKEN**
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZjA0MGNhZTE3NGUyN2ZlZGVmNGY3ZGE4NmU3NzA2MGQ2MTBjNmFmNGI4NWEwMTMyOWM1ZmQ2YzFlODlhNDQ3NGU1OWFlY2U0NzFlNzllOTciLCJpYXQiOjE3NzM3MTA2NjUuOTM4MzIxLCJuYmYiOjE3NzM3MTA2NjUuOTM4MzIyLCJleHAiOjE4MDUyNDY2NjUuOTI3NDAyLCJzdWIiOiJhMTRkMjAzZS1iMDljLTQ3NjUtOWQxNi1iZGM2NjI1OWFjY2UiLCJzY29wZXMiOlsic2hpcHBpbmctY2FsY3VsYXRlIl19.I96SaZvO7B9DTlaNiAFjGnsKX7XVfZ8ep6v5-SmclzZpJrCRpYD5CB9WAuYnAU0BW335KAfLUfR1Pa3oylrOjnckJiKQskyAKlx4CU9hJPhzMOr50yrxZD_aPtvHWR_wdMutQqMZ0os_IBpO92-9HIoEq5NqQiV7eVbHm5m4pwnks75m-c9K2Op9-2UEoYV4qugqeBRJ0IMQ6Epr5fWR9rq3KF6ksxBcqNzRpc5cCRp3ZcZrntf-wz1mddoPjXmv_Y0W0xLq2hWI7FPX-b3hItGwbPfYuM_uMyC3JPcgmasycUOjR0nooZbhB6NPI4kLDBj9u6Qj31G3pRkdsLvMIxNM3pr7uJNaD4QKqqaPLoItWig3qWz58GfRBRAwIXlm9UY8LfXPnh1ue6MRAXlux4_uxWq48KjLjoCllSwoQ9LK9fhovBrCWmTcC8EQ_VA4m8zoZhY1cm3du0S2aQ0AJn3awDHduYEa5oy8tUgKlSme0uCtnBkitxXb6Ez8BA3hdRWusg-ztnaQcd5SNf0fcmkm7EkvudooNSi5lKgcvE83iRFViSJ-pW5qe2PzhuVCucXtYBNDpOB-RZBlyDiX5R_Gqxp6oizUUnnmrceSXIaq3hux84o_lal3QglNxdG-bnF4ptcQ4tD9GBnKkZov40sz0HnSwG0HunaHMb7PWV0
```
- Environment: **Production, Preview, Development**

---

#### **MELHOR_ENVIO_API_URL**
```
https://melhorenvio.com.br/api/v2/me
```
- Environment: **Production, Preview, Development**

---

#### **ORIGIN_POSTAL_CODE**
```
44053-744
```
- Environment: **Production, Preview, Development**

---

#### **MERCADO_PAGO_ACCESS_TOKEN**
```
APP_USR-6624447637549364-031621-b9ed0dfeb480ba944b02a07396c913da-3267453961
```
- Environment: **Production, Preview, Development**

---

#### **MERCADO_PAGO_PUBLIC_KEY**
```
APP_USR-5e7b1b36-2318-4dee-be71-6bb729bde836
```
- Environment: **Production, Preview, Development**

---

#### **NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY**
```
APP_USR-5e7b1b36-2318-4dee-be71-6bb729bde836
```
- Environment: **Production, Preview, Development**

---

### 3. Salvar e Fazer Redeploy

Depois de adicionar TODAS as variáveis:

1. Vá em **"Deployments"** no menu do projeto
2. Clique nos **3 pontinhos** do último deploy
3. Clique em **"Redeploy"**
4. Aguarde 2-3 minutos

---

## ✅ Como Verificar se Funcionou:

Após o deploy, teste:

1. **Acesse:** https://atelielauraverissimo.vercel.app
2. **Vá no checkout** e teste calcular frete com CEP de São Paulo: `01310-100`
3. **Deve mostrar** opções reais de frete (PAC, SEDEX, etc.)
4. **Finalize uma compra teste** - deve gerar link do Mercado Pago

---

## 🆘 Se der erro:

1. Verifique se TODAS as 11 variáveis foram adicionadas
2. Certifique-se de marcar **Production** em cada uma
3. Faça o Redeploy novamente

---

**Me avise quando terminar de configurar!** 🚀
