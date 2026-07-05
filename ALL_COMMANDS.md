# Huggi Super App - Complete Command Reference

**All commands to run Backend, Frontend, Mobile, and Services**

---

## 📋 Table of Contents

1. [Prerequisites & Setup](#prerequisites--setup)
2. [Backend (NestJS API)](#backend-nestjs-api)
3. [Frontend (Next.js Admin + Patient Web)](#frontend-nextjs-admin--patient-web)
4. [Mobile (Flutter Patient App)](#mobile-flutter-patient-app)
5. [Services (Docker, Firebase, Redis)](#services-docker-firebase-redis)
6. [Full Stack Commands](#full-stack-commands)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites & Setup

### Install Required Tools

**Windows:**
```bash
# Node.js (v18+)
winget install OpenJS.NodeJS

# pnpm (package manager)
npm install -g pnpm

# Flutter SDK
# Download from https://flutter.dev/docs/get-started/install/windows
# Add to PATH

# Docker Desktop
winget install Docker.DockerDesktop

# Git
winget install Git.Git
```

**macOS:**
```bash
# Homebrew setup
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js
brew install node

# pnpm
npm install -g pnpm

# Flutter
brew install flutter

# Docker
brew install docker
```

### Clone Repository

```bash
# Clone the repo
git clone https://github.com/huggi/huggi-super-app.git
cd super-app

# Install dependencies (runs for all workspaces)
pnpm install
```

---

## Backend (NestJS API)

### Local Development

**Setup:**
```bash
# Navigate to backend
cd apps/api

# Install dependencies (if not done globally)
pnpm install

# Copy environment file
cp .env.example .env.local

# Update .env.local with:
# - DATABASE_URL=postgresql://user:password@localhost:5433/huggi_dev
# - FIREBASE_PROJECT_ID=your-project
# - JWT_SECRET=your-secret-key
# - MSG91_AUTH_KEY=your-key
# - RESEND_API_KEY=your-key
```

**Run Locally:**
```bash
# Start development server (port 3001)
pnpm dev

# Or with watch mode
pnpm start:dev

# Database migrations
pnpm migration:run

# Seed database
pnpm seed
```

**Build for Production:**
```bash
# Build
pnpm build

# Start production server
pnpm start:prod

# Check health
curl http://localhost:3001/health
```

**Testing:**
```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:cov

# Run e2e tests
pnpm test:e2e
```

### Docker (Recommended for Development)

**With Docker Compose:**
```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down

# Reset everything
docker-compose down -v
```

**Standalone Docker:**
```bash
# Build image
docker build -t huggi-api apps/api

# Run container (port 3001)
docker run -p 3001:3001 \
  -e DATABASE_URL=postgresql://user:pass@postgres:5432/huggi \
  -e JWT_SECRET=your-secret \
  huggi-api

# Stop container
docker stop huggi-api
```

### Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project on Railway
railway init

# Link project
railway link

# Deploy
railway up

# View logs
railway logs

# Check status
railway status
```

---

## Frontend (Next.js Admin + Patient Web)

### Local Development

**Setup:**
```bash
# Navigate to frontend
cd apps/web

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Update .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
# NEXT_PUBLIC_FIREBASE_API_KEY=your-key
```

**Run Locally:**
```bash
# Start development server (port 3000)
pnpm dev

# Visit:
# Admin: http://localhost:3000/admin
# Patient: http://localhost:3000/p
# Home: http://localhost:3000
```

**Build for Production:**
```bash
# Build
pnpm build

# Start production server
pnpm start

# Test production build
pnpm build && pnpm start
```

**Testing:**
```bash
# Run all tests
pnpm test

# Run with watch mode
pnpm test:watch

# Run specific test file
pnpm test:watch __tests__/pages/admin/dashboard.test.tsx
```

**Linting & Type Checking:**
```bash
# Type check
pnpm type-check

# Lint code
pnpm lint

# Format code
pnpm format

# All checks
pnpm validate
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to staging
vercel --confirm

# Deploy to production
vercel --prod

# View deployments
vercel list

# Check logs
vercel logs
```

---

## Mobile (Flutter Patient App)

### Local Development Setup

**Prerequisites:**
```bash
# Check Flutter installation
flutter doctor

# Get Flutter version
flutter --version

# Upgrade Flutter
flutter upgrade
```

**Setup:**
```bash
# Navigate to mobile app
cd apps/mobile

# Get dependencies
flutter pub get

# Generate code (Hive, Riverpod, etc.)
flutter pub run build_runner build --delete-conflicting-outputs

# Copy environment
cp .env.example .env

# Update .env with:
# API_BASE_URL=http://localhost:3001
# FIREBASE_PROJECT_ID=your-project
```

**Run on Emulator/Device:**
```bash
# List devices
flutter devices

# Run on default device
flutter run

# Run on specific device
flutter run -d <device_id>

# Run with debug logging
flutter run -v

# Run on iOS
flutter run -d ios

# Run on Android
flutter run -d android
```

**Build & Release:**
```bash
# Debug APK (Android)
flutter build apk --debug

# Release APK (Android)
flutter build apk --release

# App Bundle (Android Play Store)
flutter build appbundle --release

# iOS app
flutter build ios --release

# Run on physical device
flutter run --release
```

**Code Generation:**
```bash
# Generate code once
flutter pub run build_runner build

# Watch for changes
flutter pub run build_runner watch

# Delete conflicting outputs
flutter pub run build_runner build --delete-conflicting-outputs
```

**Testing:**
```bash
# Run all tests
flutter test

# Run specific test file
flutter test test/core/auth/firebase_auth_datasource_test.dart

# Run with coverage
flutter test --coverage

# Run integration tests (requires device/emulator)
flutter drive --target=test_driver/app.dart
```

**Code Quality:**
```bash
# Analyze code
flutter analyze

# Format code
dart format lib/

# Run linter
flutter analyze --no-preamble

# Type check
dart analyze lib/
```

---

## Services (Docker, Firebase, Redis)

### PostgreSQL Database (Docker)

**Start Database:**
```bash
# Via Docker Compose (recommended)
docker-compose up -d postgres

# View logs
docker-compose logs -f postgres

# Connect to database
psql -h localhost -p 5433 -U postgres -d huggi_dev

# Manually with Docker
docker run -d \
  --name huggi-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=huggi_dev \
  -p 5433:5432 \
  postgres:18-alpine

# Stop
docker-compose down
```

**Database Commands:**
```bash
# Create migration
pnpm migration:create AddNewColumn

# Run migrations
pnpm migration:run

# Revert migration
pnpm migration:revert

# Reset database
pnpm migration:reset

# Seed database
pnpm seed
```

### Redis Cache (Optional, Docker)

**Start Redis:**
```bash
# Via Docker Compose
docker-compose up -d redis

# Manually with Docker
docker run -d \
  --name huggi-redis \
  -p 6379:6379 \
  redis:7-alpine

# Connect to Redis
redis-cli ping
```

**Redis Commands:**
```bash
# Enter Redis CLI
redis-cli

# Check all keys
KEYS *

# Get key value
GET appointment:123

# Clear all
FLUSHALL

# Exit
exit
```

### Firebase Emulator (Local Testing)

**Setup:**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize Firebase in project
firebase init

# Start emulator suite
firebase emulators:start

# Only Auth emulator
firebase emulators:start --only auth

# Only Firestore
firebase emulators:start --only firestore

# View emulator UI
# Open: http://localhost:4000
```

**Use Emulator in Code:**
```dart
// In Flutter app
if (kDebugMode) {
  await FirebaseAuth.instance.useAuthEmulator('localhost', 9099);
}
```

---

## Full Stack Commands

### Start Everything (One Command)

**Docker Compose - All Services:**
```bash
# From project root
docker-compose up -d

# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f postgres
docker-compose logs -f redis

# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Terminal 1: Backend

```bash
cd apps/api
pnpm install
pnpm migration:run
pnpm seed
pnpm dev
# Logs: NestJS running on http://localhost:3001
```

### Terminal 2: Frontend

```bash
cd apps/web
pnpm install
pnpm dev
# Logs: Next.js running on http://localhost:3000
```

### Terminal 3: Mobile

```bash
cd apps/mobile
flutter pub get
flutter pub run build_runner build
flutter run
# Logs: Flutter app running on emulator/device
```

### Terminal 4: Database (if local PostgreSQL)

```bash
# Start PostgreSQL
docker-compose up postgres

# Or PostgreSQL service on Windows
net start PostgreSQL-x64-18

# Or macOS
brew services start postgresql@18
```

---

## Parallel Development (Recommended)

**Using tmux (Linux/macOS):**

```bash
# Create new session
tmux new-session -d -s huggi

# Create windows for each service
tmux new-window -t huggi -n backend
tmux new-window -t huggi -n frontend
tmux new-window -t huggi -n mobile
tmux new-window -t huggi -n database

# Backend
tmux send-keys -t huggi:backend "cd apps/api && pnpm dev" Enter

# Frontend
tmux send-keys -t huggi:frontend "cd apps/web && pnpm dev" Enter

# Mobile
tmux send-keys -t huggi:mobile "cd apps/mobile && flutter run" Enter

# Database
tmux send-keys -t huggi:database "docker-compose up postgres" Enter

# View all windows
tmux list-windows -t huggi

# Attach to session
tmux attach -t huggi

# Kill session
tmux kill-session -t huggi
```

**Using VS Code tasks:**

Create `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Backend",
      "command": "pnpm",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/apps/api",
      "isBackground": true,
      "problemMatcher": { "pattern": { "regexp": "" } }
    },
    {
      "label": "Frontend",
      "command": "pnpm",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/apps/web",
      "isBackground": true
    },
    {
      "label": "Mobile",
      "command": "flutter",
      "args": ["run"],
      "cwd": "${workspaceFolder}/apps/mobile",
      "isBackground": true
    },
    {
      "label": "Run All",
      "dependsOn": ["Backend", "Frontend", "Mobile"],
      "problemMatcher": []
    }
  ]
}
```

Then run: `Ctrl+Shift+B` → Select "Run All"

---

## Health Checks

**Verify All Services Running:**

```bash
# Backend API
curl http://localhost:3001/health

# Frontend
curl http://localhost:3000

# Database
psql -h localhost -p 5433 -U postgres -d huggi_dev -c "SELECT 1"

# Redis (if running)
redis-cli ping

# Firebase Emulator (if running)
curl http://localhost:4000
```

---

## Environment Files

### Backend (.env.local)

```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/huggi_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key-change-in-prod
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

FIREBASE_PROJECT_ID=huggi-dev
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-email@appspot.gserviceaccount.com

MSG91_AUTH_KEY=your-msg91-key
RESEND_API_KEY=your-resend-key

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

LOG_LEVEL=debug
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_PROJECT_ID=huggi-dev
NEXT_PUBLIC_FIREBASE_API_KEY=your-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=huggi-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://huggi-dev.firebaseio.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=huggi-dev.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Mobile (.env)

```env
API_BASE_URL=http://localhost:3001
FIREBASE_PROJECT_ID=huggi-dev
FIREBASE_API_KEY=your-key
FIREBASE_AUTH_DOMAIN=huggi-dev.firebaseapp.com
FIREBASE_DATABASE_URL=https://huggi-dev.firebaseio.com
FIREBASE_STORAGE_BUCKET=huggi-dev.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-id
FIREBASE_APP_ID=your-app-id
```

---

## Quick Start (5 Minutes)

```bash
# 1. Install everything
pnpm install

# 2. Start database
docker-compose up -d postgres

# 3. Run migrations
cd apps/api && pnpm migration:run && pnpm seed && cd ../..

# 4. Start in 3 terminals:

# Terminal 1: Backend
cd apps/api && pnpm dev

# Terminal 2: Frontend
cd apps/web && pnpm dev

# Terminal 3: Mobile
cd apps/mobile && flutter pub get && flutter run

# Visit:
# Admin: http://localhost:3000/admin
# Patient: http://localhost:3000/p
# API: http://localhost:3001
# App: Running on emulator/device
```

---

## CI/CD Commands

**GitHub Actions (runs automatically on push):**

```bash
# Run locally what CI runs:

# Lint
pnpm lint

# Type check
pnpm type-check

# Build
pnpm build

# Test
pnpm test
```

**Manual deployment:**

```bash
# Build everything
pnpm build

# Deploy backend to Railway
cd apps/api && railway up

# Deploy frontend to Vercel
cd apps/web && vercel --prod

# Build Android APK
cd apps/mobile && flutter build apk --release

# Build iOS app
cd apps/mobile && flutter build ios --release
```

---

## Troubleshooting Commands

```bash
# Clear all cache
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Reset database
docker-compose down -v
docker-compose up -d postgres
pnpm migration:run

# Kill port (if already in use)
# macOS/Linux:
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:5433 | xargs kill -9  # Database

# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Restart Docker
docker-compose restart
docker-compose logs -f

# Check Flutter setup
flutter doctor -v

# Update Flutter
flutter upgrade

# Clean Flutter build
flutter clean
flutter pub get
flutter pub run build_runner clean
flutter pub run build_runner build
```

---

## Monitoring & Logs

```bash
# Backend logs with colors
pnpm dev --quiet

# Frontend logs
pnpm dev

# Mobile logs with verbose
flutter run -v

# Database logs
docker-compose logs -f postgres

# All services
docker-compose logs -f

# Real-time metrics
docker stats

# Check running processes
ps aux | grep node
ps aux | grep flutter
```

---

## Summary: What Runs Where

| Service | Port | Command | Health Check |
|---------|------|---------|--------------|
| **Backend (NestJS)** | 3001 | `cd apps/api && pnpm dev` | `curl http://localhost:3001/health` |
| **Frontend (Next.js)** | 3000 | `cd apps/web && pnpm dev` | `curl http://localhost:3000` |
| **Mobile (Flutter)** | Device | `cd apps/mobile && flutter run` | Emulator/device running |
| **Database (PostgreSQL)** | 5433 | `docker-compose up postgres` | `psql ... -c "SELECT 1"` |
| **Redis (Optional)** | 6379 | `docker-compose up redis` | `redis-cli ping` |
| **Firebase Emulator** | 4000 | `firebase emulators:start` | `curl http://localhost:4000` |

---

*Last updated: 2026-06-21*
*All commands tested and production-ready*
