# ✅ COMANDOS CORRETOS PARA WINDOWS

## ⚠️ ATENÇÃO: O caminho está SEM BARRAS!

O projeto foi clonado em:
```
D:\PROJETOS-ROCHINHAPROJETOSatelier-aura-lovable
```

**NÃO é:**
```
D:\PROJETOS-ROCHINHA\PROJETOS\atelier-aura-lovable  ❌ ERRADO
```

---

## 🚀 COMANDOS PARA COPIAR E COLAR:

### 1️⃣ Entrar no diretório (PowerShell)

```powershell
cd D:\PROJETOS-ROCHINHAPROJETOSatelier-aura-lovable
```

### 2️⃣ Limpar instalação anterior (se necessário)

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
```

### 3️⃣ Instalar dependências

```powershell
npm install
```

**AGUARDE!** Isso vai demorar 3-5 minutos.

### 4️⃣ Iniciar servidor

```powershell
npm run dev
```

Deve aparecer:
```
VITE v5.x.x ready in XXX ms

➜  Local:   http://localhost:5173/
```

### 5️⃣ Abrir no navegador

```
http://localhost:5173
```

---

## 🔧 ALTERNATIVA: Usar Git Bash

Se preferir usar Git Bash (Linux-style commands):

```bash
cd /d/PROJETOS-ROCHINHAPROJETOSatelier-aura-lovable
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 🆘 PROBLEMAS COMUNS:

### Erro: "cannot find module 'vite'"
➡️ A instalação não terminou. Execute novamente: `npm install`

### Erro: "ENOENT: no such file or directory"
➡️ Você não está na pasta correta. Execute:
```powershell
cd D:\PROJETOS-ROCHINHAPROJETOSatelier-aura-lovable
pwd  # para confirmar que está no lugar certo
```

### npm install está travado
➡️ Cancele (Ctrl+C) e tente:
```powershell
npm install --legacy-peer-deps
```

---

## ✅ COMO SABER SE DEU CERTO:

Depois de `npm run dev`, você deve ver:
```
  VITE v5.4.19  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Se aparecer isso, está funcionando! 🎉

---

## 📝 APÓS TESTAR LOCALMENTE:

Veja os próximos passos em:
- **[LEIA-ME-PRIMEIRO.md](./LEIA-ME-PRIMEIRO.md)** - Visão geral
- **[MERCADOPAGO-INTEGRATION.md](./MERCADOPAGO-INTEGRATION.md)** - Configuração completa

---

**Agora sim! Com os comandos corretos! 🚀**
