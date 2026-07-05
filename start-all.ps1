# Huggi Super App - Start All Services (PowerShell)
# Usage: .\start-all.ps1 [backend|frontend|mobile|database|all]

param(
    [string]$Service = "all"
)

$Green = [ConsoleColor]::Green
$Blue = [ConsoleColor]::Cyan
$Yellow = [ConsoleColor]::Yellow

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "→ $Message" -ForegroundColor $Blue
}

function Write-Step {
    param([string]$Message)
    Write-Host $Message -ForegroundColor $Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Header
Clear-Host
Write-Host ""
Write-Host "🚀 Huggi Super App - Starting All Services" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Step "Checking prerequisites..."

$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) {
    Write-Error-Custom "Docker not found. Please install Docker Desktop."
    exit 1
}

$pnpm = Get-Command pnpm -ErrorAction SilentlyContinue
if (-not $pnpm) {
    Write-Error-Custom "pnpm not found. Run: npm install -g pnpm"
    exit 1
}

$flutter = Get-Command flutter -ErrorAction SilentlyContinue
if (-not $flutter) {
    Write-Error-Custom "Flutter not found. Install from https://flutter.dev"
    exit 1
}

Write-Success "All prerequisites found"
Write-Host ""

# Handle specific service
switch ($Service.ToLower()) {
    "backend" {
        Write-Step "Starting Backend (NestJS)..."
        Set-Location apps/api
        & pnpm dev
        exit 0
    }
    "frontend" {
        Write-Step "Starting Frontend (Next.js)..."
        Set-Location apps/web
        & pnpm dev
        exit 0
    }
    "mobile" {
        Write-Step "Starting Mobile (Flutter)..."
        Set-Location apps/mobile
        & flutter pub get
        & flutter pub run build_runner build --delete-conflicting-outputs
        & flutter run
        exit 0
    }
    "database" {
        Write-Step "Starting Database (PostgreSQL)..."
        & docker-compose up -d postgres
        Write-Success "PostgreSQL running on port 5433"
        exit 0
    }
    "all" {
        # Continue to full startup
    }
    default {
        Write-Error-Custom "Usage: .\start-all.ps1 {backend|frontend|mobile|database|all}"
        exit 1
    }
}

# Full startup
Write-Step "1/4 Starting Database (PostgreSQL)..."
& docker-compose up -d postgres
Start-Sleep -Seconds 3
Write-Success "PostgreSQL running on port 5433"
Write-Host ""

Write-Step "2/4 Setting up Backend (NestJS)..."
Push-Location apps/api
& pnpm install 2>$null | Out-Null
Pop-Location
Write-Success "Backend ready - Run in new terminal: cd apps\api; pnpm dev"
Write-Host ""

Write-Step "3/4 Setting up Frontend (Next.js)..."
Push-Location apps/web
& pnpm install 2>$null | Out-Null
Pop-Location
Write-Success "Frontend ready - Run in new terminal: cd apps\web; pnpm dev"
Write-Host ""

Write-Step "4/4 Setting up Mobile (Flutter)..."
Push-Location apps/mobile
& flutter pub get 2>$null | Out-Null
& flutter pub run build_runner build --delete-conflicting-outputs 2>$null | Out-Null
Pop-Location
Write-Success "Mobile ready - Run in new terminal: cd apps\mobile; flutter run"
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Success "All services initialized!"
Write-Host ""
Write-Step "Quick Start Instructions:"
Write-Host ""
Write-Host "Open 3 new PowerShell windows and run:"
Write-Host ""
Write-Info "Terminal 1 - Backend:"
Write-Host "  cd apps\api; pnpm dev"
Write-Host "  → http://localhost:3001"
Write-Host ""
Write-Info "Terminal 2 - Frontend:"
Write-Host "  cd apps\web; pnpm dev"
Write-Host "  → http://localhost:3000"
Write-Host ""
Write-Info "Terminal 3 - Mobile:"
Write-Host "  cd apps\mobile; flutter run"
Write-Host "  → Emulator/Device"
Write-Host ""
Write-Step "Database:"
Write-Host "  Already running at localhost:5433"
Write-Host ""
Write-Step "Helpful Commands:"
Write-Host "  • View all logs: docker-compose logs -f"
Write-Host "  • Stop everything: docker-compose down"
Write-Host "  • Reset database: docker-compose down -v; docker-compose up -d postgres"
Write-Host ""

Read-Host "Press Enter to exit"
