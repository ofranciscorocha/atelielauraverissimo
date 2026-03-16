@echo off
echo 🚀 Configurando banco de dados...
echo.

cd /d "%~dp0"

echo 📦 Instalando dependências (caso necessário)...
call npm install --silent
echo.

echo 🔧 Criando tabelas no banco...
node_modules\.bin\prisma db push
echo.

echo ✅ Tudo pronto! Agora rode: npm run dev
pause
