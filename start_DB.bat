@echo off
REM Script mejorado para ejecutar la aplicación con Prisma y SQLite en Windows
REM Versión: 1.1
REM Fecha: 05/05/2026

title Ejecutando ORM-CTIB - Sistema de Gestión de Estructuras Metálicas
color 0A
cls

echo **********************************************
echo *  INICIANDO SISTEMA DE GESTION METALURGICA  *
echo **********************************************
echo.

REM ---- Verificación de requisitos ----
echo [1/5] Verificando requisitos del sistema...

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado o no está en el PATH.
    echo Instala Node.js desde https://nodejs.org/ antes de continuar.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no está disponible.
    pause
    exit /b 1
)

where prisma >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Prisma CLI no está instalado globalmente, se usará la versión local.
)

REM ---- Instalación de dependencias ----
echo.
echo [2/5] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias con npm install.
    pause
    exit /b 1
)

REM ---- Configuración de la base de datos SQLite ----
echo.
echo [3/5] Configurando base de datos SQLite...

if not exist "prisma\dev.db" (
    echo Creando nueva base de datos SQLite...
    copy nul prisma\dev.db >nul
)

echo Aplicando migraciones...
call npx prisma migrate reset --force
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo ERROR: Fallo al aplicar migraciones de Prisma.
    pause
    exit /b 1
)

REM ---- Generación del cliente Prisma ----
echo.
echo [4/5] Generando cliente Prisma...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Fallo al generar el cliente Prisma.
    pause
    exit /b 1
)

REM ---- Inicio de la aplicación ----
echo.
echo [5/5] Iniciando la aplicación...
echo.

REM Ejecutar en modo desarrollo (ambos servidores en paralelo)
start "Vite Frontend" cmd /c "npm run dev"
timeout /t 2 >nul
start "Node Backend" cmd /c "npm run server"

echo.
echo **********************************************
echo *    SISTEMA INICIADO CORRECTAMENTE         *
echo *                                            *
echo *    Frontend: http://localhost:5173         *
echo *    Backend:  http://localhost:3000         *
echo **********************************************
echo.
pause
