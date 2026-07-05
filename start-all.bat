@echo off
REM Huggi Super App - Start All Services (Windows)
REM Usage: start-all.bat

setlocal enabledelayedexpansion

cls
echo.
echo 🚀 Huggi Super App - Starting All Services
echo ==========================================
echo.

REM Check if specific service requested
if "%1"=="" goto startall
if /i "%1"=="backend" goto start_backend
if /i "%1"=="frontend" goto start_frontend
if /i "%1"=="mobile" goto start_mobile
if /i "%1"=="database" goto start_database
if /i "%1"=="all" goto startall

echo Usage: start-all.bat {backend^|frontend^|mobile^|database^|all}
exit /b 1

:startall
echo Checking prerequisites...
where docker >nul 2>nul || (
  echo ❌ Docker not found. Please install Docker Desktop.
  exit /b 1
)
where pnpm >nul 2>nul || (
  echo ❌ pnpm not found. Run: npm install -g pnpm
  exit /b 1
)
where flutter >nul 2>nul || (
  echo ❌ Flutter not found. Install from https://flutter.dev
  exit /b 1
)

echo ✓ All prerequisites found
echo.

echo Starting Database (PostgreSQL)...
docker-compose up -d postgres
timeout /t 3 /nobreak
echo ✓ PostgreSQL running on port 5433
echo.

echo Setting up Backend (NestJS)...
cd apps\api
call pnpm install >nul 2>&1
echo ✓ Backend ready - Run: cd apps\api ^& pnpm dev
cd ..\..
echo.

echo Setting up Frontend (Next.js)...
cd apps\web
call pnpm install >nul 2>&1
echo ✓ Frontend ready - Run: cd apps\web ^& pnpm dev
cd ..\..
echo.

echo Setting up Mobile (Flutter)...
cd apps\mobile
call flutter pub get >nul 2>&1
call flutter pub run build_runner build --delete-conflicting-outputs >nul 2>&1
echo ✓ Mobile ready - Run: cd apps\mobile ^& flutter run
cd ..\..
echo.

echo ==========================================
echo ✓ All services initialized!
echo.
echo Quick Start Instructions:
echo.
echo Open 3 new Command Prompts and run:
echo.
echo Terminal 1 - Backend:
echo   cd apps\api
echo   pnpm dev
echo   ^→ http://localhost:3001
echo.
echo Terminal 2 - Frontend:
echo   cd apps\web
echo   pnpm dev
echo   ^→ http://localhost:3000
echo.
echo Terminal 3 - Mobile:
echo   cd apps\mobile
echo   flutter run
echo   ^→ Emulator/Device
echo.
echo Database:
echo   Already running at localhost:5433
echo.
echo Helpful Commands:
echo   • View all logs: docker-compose logs -f
echo   • Stop everything: docker-compose down
echo   • Reset database: docker-compose down -v ^& docker-compose up -d postgres
echo.
pause
exit /b 0

:start_backend
echo Starting Backend only...
cd apps\api
call pnpm install
call pnpm dev
exit /b 0

:start_frontend
echo Starting Frontend only...
cd apps\web
call pnpm install
call pnpm dev
exit /b 0

:start_mobile
echo Starting Mobile only...
cd apps\mobile
call flutter pub get
call flutter pub run build_runner build --delete-conflicting-outputs
call flutter run
exit /b 0

:start_database
echo Starting Database only...
docker-compose up -d postgres
echo ✓ PostgreSQL running on port 5433
pause
exit /b 0
