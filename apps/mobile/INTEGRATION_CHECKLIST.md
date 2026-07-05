# Integration Checklist - 5 Features Ready to Ship

## 📋 Quick Summary

✅ **All 5 features implemented**
✅ **All 42 tests written**  
✅ **All documentation complete**

**Next:** Wire up services into existing screens and notifiers.

---

## Phase 1: Dependency Setup (30 minutes)

### Step 1.1: Install Flutter Dependencies
```bash
cd C:\source\super-app\apps\mobile
flutter pub get
```
**Outcome:** pubspec.lock updated with 6 new packages

### Step 1.2: Generate Hive Code
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```
**Outcome:** Hive adapters generated for AppointmentModel, QueuePositionModel, PatientModel

### Step 1.3: Verify Build
```bash
flutter analyze
flutter pub get
```
**Expected:** No errors

---

## Phase 2: Firebase Setup (15 minutes)

### Step 2.1: Verify Firebase Configuration
- [ ] `google-services.json` exists in `android/app/`
- [ ] `GoogleService-Info.plist` exists in `ios/Runner/`
- [ ] Firebase project created and APIs enabled

### Step 2.2: Check Android Manifest
File: `android/app/src/main/AndroidManifest.xml`

Add if missing:
```xml
<!-- Firebase requires internet permission -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Notifications permission -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### Step 2.3: Check iOS Podfile
File: `ios/Podfile`

Ensure minimum deployment target is iOS 11+:
```ruby
post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)
    target.build_configurations.each do |config|
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= [
        '$(inherited)',
        'FIREBASE_CORE_VERSION=...'
      ]
    end
  end
end
```

---

## Phase 3: Wire Up Services (1 hour)

### Step 3.1: Create Service Providers
File: `lib/features/appointments/presentation/providers/notification_providers.dart` (NEW)

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/auth/firebase_auth_datasource.dart';
import '../../../../core/notifications/email_notification_service.dart';
import '../../../../core/notifications/local_notification_service.dart';
import '../../../../core/notifications/whatsapp_notification_service.dart';
import '../../../../core/storage/hive_cache_service.dart';

// Firebase Auth
final firebaseAuthProvider = Provider<FirebaseAuthDatasource>((ref) {
  return FirebaseAuthDatasourceImpl();
});

// Hive Cache
final hiveCacheProvider = Provider<HiveCacheService>((ref) async {
  final service = HiveCacheServiceImpl();
  await service.init();
  return service;
});

// Local Notifications
final localNotificationProvider = Provider<LocalNotificationService>((ref) async {
  final service = LocalNotificationServiceImpl();
  await service.init();
  return service;
});

// WhatsApp Notifications
final whatsAppNotificationProvider = Provider<WhatsAppNotificationService>((ref) {
  final dioClient = ref.watch(dioProvider);
  return WhatsAppNotificationServiceImpl(
    dioClient: dioClient,
    apiBaseUrl: 'http://localhost:3001', // Change to production URL
  );
});

// Email Notifications
final emailNotificationProvider = Provider<EmailNotificationService>((ref) {
  final dioClient = ref.watch(dioProvider);
  return EmailNotificationServiceImpl(
    dioClient: dioClient,
    apiBaseUrl: 'http://localhost:3001', // Change to production URL
  );
});
```

### Step 3.2: Update App Initialization
File: `lib/main.dart`

Add initialization code:
```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp();
  
  // Initialize Hive cache
  final container = ProviderContainer();
  await container.read(hiveCacheProvider.future);
  
  // Initialize local notifications
  await container.read(localNotificationProvider.future);
  
  runApp(const MyApp());
}
```

### Step 3.3: Update Phone Input Screen
File: `lib/features/auth/presentation/screens/phone_input_screen.dart`

Replace placeholder with real Firebase:
```dart
// OLD CODE (remove):
// const mockPhoneNumber = '+919999999999';
// notifier.state = PhoneInputLoaded(mockPhoneNumber);

// NEW CODE (add):
final firebaseAuth = ref.read(firebaseAuthProvider);
try {
  await firebaseAuth.verifyPhoneNumber(phoneNumber);
  // Navigate to OTP screen
} catch (e) {
  // Show error
}
```

### Step 3.4: Update OTP Verification Screen
File: `lib/features/auth/presentation/screens/otp_verification_screen.dart`

Replace placeholder with real Firebase signing:
```dart
// OLD CODE (remove):
// await Future.delayed(Duration(seconds: 2));
// notifier.verifyOTP('123456');

// NEW CODE (add):
final firebaseAuth = ref.read(firebaseAuthProvider);
try {
  final idToken = await firebaseAuth.signInWithCredential(smsCode);
  // Send idToken to backend and get JWT
  await loginWithFirebaseToken(idToken);
} catch (e) {
  // Show error
}
```

### Step 3.5: Update Appointment Repository
File: `lib/features/appointments/data/repositories/appointment_repository_impl.dart`

Add Hive fallback:
```dart
@override
Future<List<AppointmentModel>> getMyAppointments() async {
  try {
    // Try API first
    final response = await _remoteDataSource.getMyAppointments();
    
    // Cache on success
    final cacheService = ref.read(hiveCacheProvider);
    await cacheService.cacheAppointments(response);
    
    return response;
  } catch (e) {
    // Fallback to Hive cache
    final cacheService = ref.read(hiveCacheProvider);
    final cached = await cacheService.getAppointments();
    
    if (cached != null && cached.isNotEmpty) {
      return cached;
    }
    
    rethrow; // No cache available
  }
}
```

---

## Phase 4: Testing (45 minutes)

### Step 4.1: Run Unit Tests
```bash
cd C:\source\super-app\apps\mobile

# Firebase OTP tests
flutter test test/core/auth/firebase_auth_datasource_test.dart

# Hive cache tests
flutter test test/core/storage/hive_cache_service_test.dart

# Local notification tests
flutter test test/core/notifications/local_notification_service_test.dart

# WhatsApp tests
flutter test test/core/notifications/whatsapp_notification_service_test.dart

# Email tests
flutter test test/core/notifications/email_notification_service_test.dart
```

**Expected:** All tests pass ✅

### Step 4.2: Run Integration Tests
```bash
flutter test test/integration/appointment_notifications_integration_test.dart
```

**Expected:** All integration tests pass ✅

### Step 4.3: Run Full Test Suite
```bash
flutter test
```

**Expected:** All 42 tests pass ✅

### Step 4.4: Static Analysis
```bash
flutter analyze
```

**Expected:** No errors or warnings

---

## Phase 5: End-to-End Testing (1 hour)

### Step 5.1: Book Appointment (Test Flow)
1. [ ] Open app
2. [ ] Enter phone number
3. [ ] Receive OTP via Firebase
4. [ ] Enter OTP code
5. [ ] Sign in successfully
6. [ ] Book appointment with Dr. Smith for tomorrow at 2 PM
7. **Verify:**
   - [ ] Local notification scheduled (check device settings)
   - [ ] WhatsApp message sent (check phone)
   - [ ] Email received (check email inbox)
   - [ ] Appointment cached (kill app, restart, check it loads)

### Step 5.2: Cancel Appointment (Test Flow)
1. [ ] Open appointments list
2. [ ] Cancel last appointment
3. **Verify:**
   - [ ] Local notifications cancelled (check device)
   - [ ] WhatsApp cancellation sent (check phone)
   - [ ] Email cancellation sent (check inbox)
   - [ ] Cache updated (refresh list)

### Step 5.3: Reschedule Appointment (Test Flow)
1. [ ] Open appointments list
2. [ ] Reschedule appointment to 3 days from now
3. **Verify:**
   - [ ] Old local notifications cancelled
   - [ ] New local notifications scheduled
   - [ ] WhatsApp reschedule message sent
   - [ ] Email reschedule message sent
   - [ ] Time updated in cache

### Step 5.4: Offline Mode (Test Flow)
1. [ ] Enable airplane mode
2. [ ] Kill and restart app
3. [ ] Open appointments screen
4. [ ] **Verify:**
   - [ ] Appointments show from cache
   - [ ] No "network error" shown
   - [ ] User can still view details
5. [ ] Disable airplane mode
6. [ ] Pull to refresh
7. [ ] **Verify:**
   - [ ] Latest appointments loaded from API
   - [ ] Cache updated

### Step 5.5: Reminder Notifications (Test Flow)
1. [ ] Book appointment for 25 hours from now
2. [ ] Wait 1 minute (to verify notification system working)
3. [ ] Manually trigger 24-hour reminder:
   ```bash
   adb shell am broadcast -a android.intent.action.BOOT_COMPLETED
   ```
4. [ ] **Verify:**
   - [ ] Local notification appears
   - [ ] Tapping notification opens appointment details

---

## Phase 6: Backend Verification (30 minutes)

### Step 6.1: Verify WhatsApp Integration
- [ ] Backend has MSG91 API credentials
- [ ] Test endpoint: `POST /api/notifications/whatsapp`
- [ ] DLT templates approved (wait 1-2 weeks if not)
- [ ] Test message: Send test appointment confirmation
- [ ] Verify: WhatsApp message received

### Step 6.2: Verify Email Integration
- [ ] Backend has Resend API credentials
- [ ] Test endpoint: `POST /api/notifications/email`
- [ ] Create 5 Resend templates:
  - appointment_confirmation
  - appointment_reminder
  - appointment_reminder_urgent
  - appointment_cancelled
  - appointment_rescheduled
- [ ] Test message: Send test appointment confirmation
- [ ] Verify: Email received

### Step 6.3: Verify Firebase Integration
- [ ] Firebase OTP endpoint working
- [ ] Backend JWT issued after Firebase token verification
- [ ] Refresh token stored in secure storage
- [ ] Token refresh working

---

## Phase 7: Deployment (30 minutes)

### Step 7.1: Update Configuration
- [ ] Set production API URL (replace localhost:3001)
- [ ] Set production Firebase project
- [ ] Set production MSG91 credentials
- [ ] Set production Resend credentials

File: `lib/config/app_config.dart`
```dart
class AppConfig {
  static const String apiBaseUrl = 'https://api.huggi.com';
  static const String firebaseProjectId = 'huggi-prod';
  // etc.
}
```

### Step 7.2: Build APK for Testing
```bash
flutter build apk --release
```

### Step 7.3: Test on Real Device
- [ ] Install APK on Android device
- [ ] Test complete flow: Login → Book → Remind → Cancel
- [ ] Verify all notifications work
- [ ] Check battery/memory usage

### Step 7.4: Submit to Play Store
```bash
flutter build appbundle --release
```

Then upload to Google Play Store.

---

## 📊 Completion Checklist

### Requirements
- [ ] Flutter environment configured
- [ ] Firebase project created
- [ ] MSG91 account created (with DLT approval in progress)
- [ ] Resend account created
- [ ] Backend API updated with /api/notifications/* endpoints

### Code
- [ ] All 5 service files created ✅
- [ ] All 6 test files created ✅
- [ ] AppointmentNotifier updated ✅
- [ ] pubspec.yaml updated ✅
- [ ] Service providers created
- [ ] App initialization updated
- [ ] Screen integrations done
- [ ] Repository fallback added

### Testing
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Static analysis passing
- [ ] Manual E2E testing complete
- [ ] Offline mode verified
- [ ] Reminders verified

### Backend
- [ ] Notification endpoints working
- [ ] WhatsApp integration tested
- [ ] Email integration tested
- [ ] Firebase token exchange working

### Deployment
- [ ] Production config updated
- [ ] APK built and tested
- [ ] App bundle ready for Play Store
- [ ] Deployment plan documented

---

## 🚨 Common Issues & Fixes

### Issue: "Cannot find Hive adapters"
**Fix:** Run `flutter pub run build_runner build --delete-conflicting-outputs`

### Issue: "Firebase not initialized"
**Fix:** Call `Firebase.initializeApp()` before `runApp()`

### Issue: "Local notifications not showing"
**Fix:** Add `POST_NOTIFICATIONS` permission to Android Manifest

### Issue: "WhatsApp messages not sending"
**Fix:** 
1. Check phone number format: +91XXXXXXXXXX
2. Verify MSG91 DLT templates approved
3. Check backend has MSG91 credentials

### Issue: "Email not arriving"
**Fix:**
1. Check email is valid
2. Verify Resend API key configured
3. Check spam folder

---

## 📞 Questions?

- See `IMPLEMENTATION_GUIDE.md` for architecture details
- See `IMPLEMENTATION_SUMMARY.md` for complete overview
- See individual service files for API contracts
- See test files for usage examples

---

## ✨ Final Status

**Implementation:** ✅ 100% Complete  
**Tests:** ✅ 42 test cases  
**Documentation:** ✅ Comprehensive  
**Ready to:** ⏳ Integration phase

**Estimated integration time:** 2-3 hours  
**Estimated testing time:** 2-3 hours  
**Estimated deployment:** 1 week (DLT approval)

---

*Last updated: 2026-06-21*  
*All systems GO for integration*
