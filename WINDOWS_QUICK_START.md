# 🚀 Windows Quick Start - Run Everything Now

**For Windows Users** - Fastest way to get all services running

---

## ⚡ 30-Second Start

### Option 1: PowerShell (Easiest - Recommended)

```powershell
# Open PowerShell in the super-app directory
cd C:\source\super-app

# Run the startup script
.\start-all.ps1
```

Done! It will:
✅ Start database (Docker)  
✅ Setup backend  
✅ Setup frontend  
✅ Setup mobile  
✅ Show you what to run next

### Option 2: Batch File

```batch
# Open Command Prompt in the super-app directory
cd C:\source\super-app

# Run the startup script
start-all.bat
```

### Option 3: Manual (No Scripts)

Skip scripts and do it yourself in 4 terminals.

---

## 📋 Manual Setup (5 Minutes)

### Before You Start

Make sure you have installed:
- ✅ Node.js (v18+)
- ✅ pnpm (`npm install -g pnpm`)
- ✅ Docker Desktop (running)
- ✅ Flutter SDK

Check versions:
```powershell
node --version          # v18+
pnpm --version         # 8+
docker --version       # 20+
flutter --version      # 3.20+
```

---

## 🏃 Step-by-Step (4 Terminals)

### Terminal 1️⃣ - Database

```powershell
# Start PostgreSQL in Docker
docker-compose up -d postgres

# Wait 3 seconds, then verify
docker ps | findstr postgres

# Should show: huggi-postgres ... Up

# Done! Leave it running
```

### Terminal 2️⃣ - Backend (NestJS)

```powershell
# Navigate to backend
cd apps\api

# Install dependencies
pnpm install

# Run database migrations (first time only)
pnpm migration:run

# Seed sample data (first time only)
pnpm seed

# Start backend
pnpm dev

# Should show:
# [Nest] 12345 - ... LOG [NestFactory] Nest application successfully started
# Server is running on http://localhost:3001
```

**Test it works:**
```powershell
# Open new PowerShell, run:
curl http://localhost:3001/health

# Should return: {"status":"ok"}
```

### Terminal 3️⃣ - Frontend (Next.js)

```powershell
# Navigate to frontend
cd apps\web

# Install dependencies
pnpm install

# Start frontend
pnpm dev

# Should show:
# ▲ Next.js 14.0.0
#   - Local:        http://localhost:3000

# Visit in browser:
# http://localhost:3000/p (patient)
# http://localhost:3000/admin (admin)
```

### Terminal 4️⃣ - Mobile (Flutter)

```powershell
# Navigate to mobile
cd apps\mobile

# Get dependencies
flutter pub get

# Generate code
flutter pub run build_runner build --delete-conflicting-outputs

# Run on device/emulator
flutter run

# Choose device when prompted:
# 1. Android Emulator
# 2. iOS Simulator  
# 3. Physical device

# Should show Flutter app on emulator/device
```

---

## ✅ Everything Running?

Check each service:

| Service | Command | Expected Result |
|---------|---------|-----------------|
| **Backend** | `curl http://localhost:3001/health` | `{"status":"ok"}` |
| **Frontend** | Open http://localhost:3000 | Blue Huggi homepage |
| **Mobile** | Check emulator/device | Flutter app visible |
| **Database** | `docker ps` | postgres container UP |

---

## 🧪 Test the Complete Flow

1. **Open mobile app** (running on emulator/device)

2. **Log in:**
   - Enter phone: `9876543210`
   - Wait for OTP (Firebase Emulator or real SMS)
   - Enter OTP
   - Should log in

3. **Book appointment:**
   - Tap "Book Appointment"
   - Fill details
   - Confirm
   - **Should trigger:**
     ✓ Local notification (device)
     ✓ WhatsApp message (if configured)
     ✓ Email (if configured)
     ✓ Cached in Hive
     ✓ Saved in database

4. **View appointment:**
   - See it in app
   - Kill app & restart
   - **Should still be visible** (offline cache works!)

5. **Cancel appointment:**
   - Tap appointment → Cancel
   - **Should trigger:**
     ✓ Cancel notifications
     ✓ WhatsApp cancellation
     ✓ Email cancellation

---

## 📱 If Flutter Emulator Fails

**Android:**
```powershell
# List emulators
flutter emulators

# Create new one
flutter emulators create --name MyDevice

# Run emulator
emulator -avd MyDevice

# Then:
flutter run
```

**iOS (macOS only):**
```powershell
# Open simulator
open -a Simulator

# Then:
flutter run
```

**Physical Device:**
```powershell
# Connect device via USB
# Enable Developer Mode

# List devices
flutter devices

# Run on device
flutter run -d <device-id>
```

---

## 🛑 Stop Services

```powershell
# Each terminal running a service: Press Ctrl+C

# Docker:
docker-compose down

# Or (from any terminal):
docker-compose down
```

---

## 🔄 Restart Services

```powershell
# Backend
cd apps\api && pnpm dev

# Frontend
cd apps\web && pnpm dev

# Mobile
flutter run

# Database (if stopped)
docker-compose up -d postgres
```

---

## 🐛 Common Issues

### "Port 3001 already in use"
```powershell
# Kill process using port 3001
netstat -ano | findstr :3001
# Note the PID, then:
taskkill /PID <PID> /F
```

### "Docker not running"
```powershell
# Start Docker Desktop (look for icon in taskbar)
# Or:
dockerd
```

### "pnpm not found"
```powershell
npm install -g pnpm@latest
pnpm --version
```

### "Flutter not found"
```powershell
# Add Flutter to PATH
# Download from https://flutter.dev
# Add C:\flutter\bin to PATH
# Restart PowerShell
flutter --version
```

### "Migration failed"
```powershell
# Reset database
docker-compose down -v
docker-compose up -d postgres

# Then:
cd apps\api
pnpm migration:run
pnpm seed
pnpm dev
```

---

## 📊 All Running?

You should see:

**Terminal 1 (Database):**
```
Creating huggi-postgres ... done
```

**Terminal 2 (Backend):**
```
[Nest] 12345 - ... LOG [NestFactory] Nest application successfully started
Server is running on http://localhost:3001
```

**Terminal 3 (Frontend):**
```
▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local
```

**Terminal 4 (Mobile):**
```
✓ Built build/app/outputs/flutter-apk/app-debug.apk.
✓ Installing and launching...
```

---

## 🎯 Next: Run Tests

```powershell
# All 42 tests
cd apps\mobile
flutter test

# Specific test
flutter test test/core/auth/firebase_auth_datasource_test.dart

# With coverage
flutter test --coverage
```

---

## 💡 Pro Tips

1. **Use VS Code terminal** - Open 4 terminals at once
2. **Use Windows Terminal** - Tabs for each service
3. **Minimize but keep running** - Leave terminals open
4. **Monitor logs** - Errors appear immediately
5. **Save your work** - Commit before restarting

---

## 📝 Command Cheat Sheet

```powershell
# Backend
cd apps\api
pnpm dev                    # Start
pnpm test                   # Test
pnpm migration:run          # Migrate DB
pnpm seed                   # Seed data

# Frontend
cd apps\web
pnpm dev                    # Start
pnpm test                   # Test
pnpm build                  # Build

# Mobile
cd apps\mobile
flutter run                 # Start
flutter test                # Test
flutter build apk --release # Build APK

# Docker
docker-compose up -d        # Start
docker-compose down         # Stop
docker-compose logs -f      # View logs
docker ps                   # List containers
```

---

## ✨ Congratulations! 🎉

You now have:
- ✅ Backend API running (3001)
- ✅ Frontend web running (3000)
- ✅ Mobile app running (emulator/device)
- ✅ Database running (5433)
- ✅ All 5 notification services integrated
- ✅ Offline support with Hive caching
- ✅ Firebase OTP authentication

**Ready to:**
- Make code changes (hot reload)
- Test features
- Run tests
- Deploy to production

---

## 🚀 Deploy to Production

Once tested locally:

```powershell
# Backend (Railway)
cd apps\api
railway up

# Frontend (Vercel)
cd apps\web
vercel --prod

# Mobile (Google Play Store)
cd apps\mobile
flutter build appbundle --release
# Upload to Google Play Console
```

---

## 📞 Need Help?

- Check `ALL_COMMANDS.md` for all commands
- Check `RUN_ALL_SERVICES.md` for detailed guide
- Check `IMPLEMENTATION_GUIDE.md` for architecture
- Check logs in each terminal

---

**Happy coding! 🚀**

*Everything is now running locally.*

Last updated: 2026-06-21
