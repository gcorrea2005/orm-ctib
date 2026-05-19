@echo off
REM Script de arranque rápido - Sistema de Gestión de Estructuras Metálicas
REM Versión: 1.1
REM Fecha: 05/05/2026

title ORM-CTIB - Sistema en Ejecución
color 0B
cls

echo **********************************************
echo *     INICIANDO SISTEMA (MODO RAPIDO)       *
echo **********************************************
echo.

REM ---- Verificación básica ----
echo [1/3] Verificando entorno...

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está disponible o no está en el PATH.
    echo Ejecuta el script de instalación completo primero.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo ERROR: No se encontraron dependencias instaladas.
    echo Ejecuta el script de instalación completo primero.
    pause
    exit /b 1
)

REM ---- Verificación del cliente Prisma ----
echo [2/3] Verificando cliente Prisma...
if not exist "node_modules\.prisma" (
    echo Generando cliente Prisma...
    npx prisma generate
    if %errorlevel% neq 0 (
        echo ERROR: Fallo al generar el cliente Prisma.
        pause
        exit /b 1
    )
)

REM ---- Inicio de la aplicación ----
echo [3/3] Iniciando la aplicación...
echo.

REM Ejecutar en modo desarrollo (ambos servidores en paralelo)
start "Vite Frontend" cmd /c "npm run dev"
timeout /t 2 >nul
start "Node Backend" cmd /c "npm run server"

echo **********************************************
echo *    SISTEMA INICIADO CORRECTAMENTE         *
echo *                                            *
echo *    Frontend: http://localhost:5173         *
echo *    Backend:  http://localhost:3000         *
echo **********************************************
echo.
echo Nota: Este script solo inicia los servidores
echo       sin modificar la base de datos.
echo.
pause
