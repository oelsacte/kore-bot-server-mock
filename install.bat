@echo off
echo ========================================
echo   Kore.ai Mock Server - Installer
echo ========================================
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Verificando Node.js...
node --version
echo.

echo [2/4] Instalando dependencias...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fallo la instalacion de dependencias
    pause
    exit /b 1
)
echo.

echo [3/4] Configurando archivo .env...
if not exist .env (
    copy .env.example .env
    echo Archivo .env creado desde .env.example
) else (
    echo Archivo .env ya existe
)
echo.

echo [4/4] Verificando estructura...
if not exist config\responses.json (
    echo [ERROR] Falta config\responses.json
    pause
    exit /b 1
)
echo.

echo ========================================
echo   Instalacion Completada!
echo ========================================
echo.
echo Para iniciar el servidor, ejecuta:
echo   npm start
echo.
echo O usa el archivo start.bat
echo.
pause
