# 🚀 Run All Services - Complete Guide

This guide shows how to run **Backend**, **Frontend**, **Mobile**, and **Services** for Huggi Super App.

---

## ⚡ Quick Start (Recommended)

### Windows Users

```powershell
# Option 1: PowerShell (Recommended)
.\start-all.ps1

# Option 2: Batch file
start-all.bat

# Option 3: Manual - Open 3 terminals

# Terminal 1 - Backend
cd apps/api
pnpm dev

# Terminal 2 - Frontend
cd apps/web
pnpm dev

# Terminal 3 - Mobile
cd apps/mobile
flutter run
```

### macOS/Linux Users

```bash
# Make script executable
chmod +x start-all.sh

# Run all services
./start-all.sh

# Or run specific service
./start-all.sh backend   # Just backend
./start-all.sh frontend  # Just frontend
./start-all.sh mobile    # Just mobile
./start-all.sh database  # Just database
```

---

## 📋 Terminal-by-Terminal Setup (5 Minutes)

### Prerequisites Check

```bash
# Verify everything is installed
docker --version        # Should be 20+
pnpm --version         # Should be 8+
flutter --version      # Should be 3.20+
node --version         # Should be 18+
```

### Step 1: Clone & Install

```bash
git clone https://github.com/huggi/huggi-super-app.git
cd super-app
pnpm install
```

### Step 2: Start Database

```bash
# Terminal 1
docker-compose up -d postgres

# Verify
docker ps | grep postgres
# Should show: huggi-postgres ... Up

# Or test connection
psql -h localhost -p 5433 -U postgres -d huggi_dev -c "SELECT 1"
```

### Step 3: Start Backend

```bash
# Terminal 2
cd apps/api
pnpm install
pnpm migration:run  # One-time: run database migrations
pnpm seed           # One-time: seed sample data
pnpm dev

# Should see:
# [Nest] 12345  - 01/15/2026, 10:30:45 AM     LOG [NestFactory] Nest application successfully started
# Server is running on http://localhost:3001
```

**Health check:**
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

### Step 4: Start Frontend

```bash
# Terminal 3
cd apps/web
pnpm install
pnpm dev

# Should see:
# ▲ Next.js 14.0.0
#   - Local:        http://localhost:3000
```

**Access:**
- Admin: http://localhost:3000/admin
- Patient: http://localhost:3000/p
- Home: http://localhost:3000

### Step 5: Start Mobile

```bash
# Terminal 4
cd apps/mobile
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
flutter run

# Choose device:
# 1. Android Emulator
# 2. iOS Simulator
# 3. Physical device
```

---

## 🔧 Services Status

Once everything is running:

| Service | URL | Status Check |
|---------|-----|--------------|
| **Backend API** | http://localhost:3001 | `curl http://localhost:3001/health` |
| **Frontend (Web)** | http://localhost:3000 | Visit in browser |
| **Mobile App** | Device/Emulator | Should show app |
| **Database** | localhost:5433 | `psql ... -c "SELECT 1"` |
| **Redis** | localhost:6379 | `redis-cli ping` (optional) |

---

## 📁 What Each Service Does

### Backend (Port 3001)
- REST API endpoints
- Authentication (Firebase OTP)
- Appointment management
- WhatsApp notifications (MSG91)
- Email notifications (Resend)
- Database operations

**Check logs:**
```bash
cd apps/api
pnpm dev  # Already running - see logs
```

### Frontend (Port 3000)
- Admin dashboard (/admin)
- Patient web interface (/p)
- Responsive UI (ShadCN components)
- Tailwind styling

**Check logs:**
```bash
cd apps/web
pnpm dev  # Already running - see logs
```

### Mobile (Emulator/Device)
- Flutter patient app
- Firebase OTP authentication
- Offline support (Hive cache)
- Local notifications
- Appointment booking

**Check logs:**
```bash
cd apps/mobile
flutter run -v  # Verbose logs
```

### Database (Port 5433)
- PostgreSQL 18
- All patient/appointment data
- NestJS Prisma ORM

**Access database:**
```bash
psql -h localhost -p 5433 -U postgres -d huggi_dev

# Common queries:
\dt                    # List tables
SELECT * FROM users;   # View users
SELECT * FROM appointments;  # View appointments
\q                     # Exit
```

---

## 🛑 Stop Services

**Stop specific service:**
```bash
# Ctrl+C in the terminal running the service
# For Docker:
docker-compose down
```

**Stop everything:**
```bash
# Kill all
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## 🔄 Restart Services

**Restart individual service:**
```bash
# Stop it (Ctrl+C), then run again
cd apps/api && pnpm dev      # Backend
cd apps/web && pnpm dev      # Frontend
flutter run                   # Mobile
```

**Restart everything:**
```bash
docker-compose down
docker-compose up -d postgres

# Then restart backend, frontend, mobile in new terminals
```

---

## 🐛 Troubleshooting

### "Port 3001 already in use"

```bash
# Find what's using port 3001
# macOS/Linux:
lsof -ti:3001 | xargs kill -9

# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### "Docker not running"

```bash
# Start Docker Desktop (GUI)
# Or on macOS:
brew services start docker

# Or Linux:
sudo systemctl start docker
```

### "Flutter emulator not found"

```bash
# List available emulators
flutter emulators

# Create Android emulator
flutter emulators create --name my_device

# Create iOS simulator
open -a Simulator
```

### "Database connection refused"

```bash
# Check if postgres is running
docker ps | grep postgres

# Restart postgres
docker-compose down
docker-compose up -d postgres

# Test connection
psql -h localhost -p 5433 -U postgres -d huggi_dev -c "SELECT 1"
```

### "pnpm not found"

```bash
npm install -g pnpm@latest
pnpm --version
```

---

## 📊 Full Stack Logs

**View all logs:**
```bash
docker-compose logs -f

# Or specific service:
docker-compose logs -f postgres
docker-compose logs -f api
```

**View service logs:**
```bash
# In the terminal running each service (they show logs automatically)
# Backend: pnpm dev
# Frontend: pnpm dev
# Mobile: flutter run -v
```

---

## ✅ Verification Checklist

After starting all services:

- [ ] Backend running at http://localhost:3001/health
- [ ] Frontend running at http://localhost:3000
- [ ] Mobile running on emulator/device
- [ ] Database connected (port 5433)
- [ ] Can create appointment in mobile app
- [ ] Receive WhatsApp notification (if configured)
- [ ] Receive email notification (if configured)

---

## 💡 Tips

1. **Use multiple terminal tabs** - Makes it easier to switch between services
2. **Monitor logs** - Always keep an eye on error messages
3. **Test one at a time** - Start backend, verify, then frontend, then mobile
4. **Use curl** - Test API endpoints: `curl http://localhost:3001/health`
5. **Check Docker** - Ensure Docker Desktop is running before starting

---

## 🚀 First Test Flow

Once everything is running:

```bash
# 1. Open in browser
http://localhost:3000/p

# 2. Enter phone number (e.g., +919876543210)
# Firebase will send OTP

# 3. Enter OTP (check Firebase Emulator UI for test OTP)
# Should log in

# 4. Book appointment
# Should trigger:
# - Local notification
# - WhatsApp message (if MSG91 configured)
# - Email (if Resend configured)
# - Hive cache
# - Database entry

# 5. Cancel appointment
# Should trigger:
# - Cancel local notifications
# - WhatsApp cancellation
# - Email cancellation
```

---

## 📞 Quick Commands Reference

```bash
# Backend
cd apps/api && pnpm dev           # Start
pnpm test                         # Run tests
pnpm migration:run                # Run migrations
pnpm seed                         # Seed database

# Frontend
cd apps/web && pnpm dev           # Start
pnpm test                         # Run tests
pnpm build                        # Build production

# Mobile
cd apps/mobile && flutter run     # Start
flutter test                      # Run tests
flutter build apk --release       # Build APK

# Database
docker-compose up -d postgres     # Start
docker-compose down -v            # Stop & reset

# All services
docker-compose logs -f            # View logs
docker-compose down               # Stop all
docker ps                         # Check running
```

---

## 🎯 Next Steps

1. **Verify all services running** ✓
2. **Test complete flow** (book → cancel appointment)
3. **Check notifications** (local, WhatsApp, email)
4. **Run tests** (42 test cases)
5. **Deploy** (production)

---

**Everything running?** 🎉

You're ready to:
- Make code changes and see them live
- Test the mobile app
- Verify notifications
- Deploy to production

Happy coding! 🚀

---

*Last updated: 2026-06-21*
*All services tested and ready*
