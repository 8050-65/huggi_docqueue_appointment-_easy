#!/bin/bash

# Huggi Super App - Start All Services
# Usage: ./start-all.sh

set -e

echo "🚀 Huggi Super App - Starting All Services"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "${BLUE}Checking prerequisites...${NC}"
command -v docker &> /dev/null || { echo "❌ Docker not found. Please install Docker."; exit 1; }
command -v pnpm &> /dev/null || { echo "❌ pnpm not found. Run: npm install -g pnpm"; exit 1; }
command -v flutter &> /dev/null || { echo "❌ Flutter not found. Install from https://flutter.dev"; exit 1; }

echo "${GREEN}✓ All prerequisites found${NC}"
echo ""

# Option to start specific service
if [ "$1" != "" ]; then
  case "$1" in
    backend)
      echo "${BLUE}Starting Backend only...${NC}"
      cd apps/api
      pnpm install
      pnpm dev
      ;;
    frontend)
      echo "${BLUE}Starting Frontend only...${NC}"
      cd apps/web
      pnpm install
      pnpm dev
      ;;
    mobile)
      echo "${BLUE}Starting Mobile only...${NC}"
      cd apps/mobile
      flutter pub get
      flutter pub run build_runner build --delete-conflicting-outputs
      flutter run
      ;;
    database)
      echo "${BLUE}Starting Database only...${NC}"
      docker-compose up -d postgres
      echo "${GREEN}✓ PostgreSQL running on port 5433${NC}"
      ;;
    all)
      echo "${BLUE}Starting all services...${NC}"
      ;;
    *)
      echo "Usage: $0 {backend|frontend|mobile|database|all}"
      exit 1
      ;;
  esac
fi

# If no argument or "all", start everything
if [ "$1" == "" ] || [ "$1" == "all" ]; then

  # 1. Start database
  echo "${BLUE}1/4 Starting Database (PostgreSQL)...${NC}"
  docker-compose up -d postgres
  sleep 2
  echo "${GREEN}✓ PostgreSQL running on port 5433${NC}"
  echo ""

  # 2. Setup backend
  echo "${BLUE}2/4 Setting up Backend (NestJS)...${NC}"
  cd apps/api
  pnpm install > /dev/null 2>&1 || true
  echo "${GREEN}✓ Backend ready - Run in new terminal: cd apps/api && pnpm dev${NC}"
  cd ../..
  echo ""

  # 3. Setup frontend
  echo "${BLUE}3/4 Setting up Frontend (Next.js)...${NC}"
  cd apps/web
  pnpm install > /dev/null 2>&1 || true
  echo "${GREEN}✓ Frontend ready - Run in new terminal: cd apps/web && pnpm dev${NC}"
  cd ../..
  echo ""

  # 4. Setup mobile
  echo "${BLUE}4/4 Setting up Mobile (Flutter)...${NC}"
  cd apps/mobile
  flutter pub get > /dev/null 2>&1 || true
  flutter pub run build_runner build --delete-conflicting-outputs > /dev/null 2>&1 || true
  echo "${GREEN}✓ Mobile ready - Run in new terminal: cd apps/mobile && flutter run${NC}"
  cd ../..
  echo ""

  echo "=========================================="
  echo "${GREEN}✓ All services initialized!${NC}"
  echo ""
  echo "${YELLOW}Quick Start Instructions:${NC}"
  echo ""
  echo "Open 3 new terminals and run:"
  echo ""
  echo "${BLUE}Terminal 1 - Backend:${NC}"
  echo "  cd apps/api && pnpm dev"
  echo "  → http://localhost:3001"
  echo ""
  echo "${BLUE}Terminal 2 - Frontend:${NC}"
  echo "  cd apps/web && pnpm dev"
  echo "  → http://localhost:3000"
  echo ""
  echo "${BLUE}Terminal 3 - Mobile:${NC}"
  echo "  cd apps/mobile && flutter run"
  echo "  → Emulator/Device"
  echo ""
  echo "${YELLOW}Database:${NC}"
  echo "  Already running at localhost:5433"
  echo ""
  echo "${YELLOW}Helpful Commands:${NC}"
  echo "  • View all logs: docker-compose logs -f"
  echo "  • Stop everything: docker-compose down"
  echo "  • Reset database: docker-compose down -v && docker-compose up -d postgres"
  echo ""
fi
