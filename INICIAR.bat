@echo off
echo.
echo ========================================
echo   Laura Verissimo Atelie - Localhost
echo ========================================
echo.
echo Iniciando servidor de desenvolvimento...
echo.

cd /d D:\PROJETOS-ROCHINHAPROJETOSatelier-aura-lovable

if not exist "node_modules\" (
    echo [AVISO] node_modules nao encontrado!
    echo Instalando dependencias... Isso pode demorar alguns minutos.
    echo.
    call npm install
)

echo.
echo Iniciando Vite...
echo.
call npm run dev

pause
