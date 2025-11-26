@echo off
echo ========================================
echo   Iniciando Kore.ai Mock Server
echo ========================================
echo.

REM Verificar que existe node_modules
if not exist node_modules (
    echo [ERROR] Dependencias no instaladas
    echo.
    echo Ejecuta primero: install.bat
    echo O: npm install
    echo.
    pause
    exit /b 1
)

REM Verificar archivo .env
if not exist .env (
    echo [ADVERTENCIA] Archivo .env no encontrado
    echo Creando desde .env.example...
    copy .env.example .env
    echo.
)

echo Iniciando servidor...
echo.
echo Presiona Ctrl+C para detener el servidor
echo ========================================
echo.

node server.js
