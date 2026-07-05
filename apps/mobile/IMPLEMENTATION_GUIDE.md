# Huggi Patient App - 5 Features Implementation Guide

This document explains the 5 notification and authentication features implemented in the Huggi Patient Mobile App.

## Overview

| Feature | Type | Purpose | Status |
|---------|------|---------|--------|
| **Firebase OTP** | Authentication | Phone number verification for patient login | ✅ Implemented |
| **Hive Caching** | Storage | Offline support with local database | ✅ Implemented |
| **Local Notifications** | Push | Device reminders (24h + 1h before appointment) | ✅ Implemented |
| **WhatsApp Notifications** | Messaging | Appointment updates via WhatsApp (Twilio) | ✅ Implemented |
| **Email Notifications** | Messaging | Appointment updates via Email (Resend) | ✅ Implemented |

---

## 1. Firebase OTP Authentication

### File: `lib/core/auth/firebase_auth_datasource.dart`

**Purpose:** Implement real Firebase phone authentication for patient login.

**Key Methods:**

```dart
// Initiate phone verification (sends OTP via SMS)
Future<void> verifyPhoneNumber(String phoneNumber);

// Complete authentication with SMS code
Future<String> signInWithCredential(String smsCode);

// Get current user's ID token
Future<String?> getIdToken();

// Sign out user
Future<void> signOut();
```

**Flow:**
1. Patient enters phone number
2. Firebase sends OTP via SMS (free 10k/month quota)
3. Patient enters OTP code
4. Firebase verifies and returns ID token
5. Backend exchange: Firebase ID token → Huggi JWT

**Backend Integration:**
- Firebase Auth handles phone OTP
- No DLT registration required (Firebase managed)
- Backend validates JWT and issues app tokens

**Tests:** `test/core/auth/firebase_auth_datasource_test.dart`

---

## 2. Hive Caching (Offline Support)

### File: `lib/core/storage/hive_cache_service.dart`

**Purpose:** Cache appointments and queue data locally for offline access.

**Key Methods:**

```dart
// Cache full appointment list
Future<void> cacheAppointments(List<AppointmentModel> appointments);

// Retrieve cached appointments (returns null if empty)
Future<List<AppointmentModel>?> getAppointments();

// Cache patient's current queue position
Future<void> cacheQueuePosition(QueuePositionModel queuePosition);

// Retrieve cached queue position
Future<QueuePositionModel?> getQueuePosition();

// Cache patient profile
Future<void> cachePatientProfile(PatientModel patient);

// Clear all cached data
Future<void> clearAll();
```

**Data Storage:**
- `appointments` box: List of appointment records
- `queue_position` box: Current queue status
- `patient_profile` box: Patient demographic data

**Offline Behavior:**
```
API Success ──→ Update Hive cache + return data
   ↓
API Fails ──→ Return cached data (if available)
   ↓
No cache ──→ Return null (show empty state)
```

**Tests:** `test/core/storage/hive_cache_service_test.dart`

---

## 3. Local Notifications (Device Push)

### File: `lib/core/notifications/local_notification_service.dart`

**Purpose:** Schedule device notifications for appointment reminders.

**Key Methods:**

```dart
// Initialize notification system (call on app startup)
Future<void> init();

// Schedule both 24h and 1h reminders for an appointment
Future<void> scheduleAppointmentReminders(AppointmentEntity appointment);

// Cancel reminders for an appointment
Future<void> cancelReminder(String appointmentId);

// Cancel all scheduled reminders
Future<void> cancelAllReminders();
```

**Notification Schedule:**

```
Appointment scheduled for 2:00 PM
├─ 24 hours before: 2:00 PM (previous day)
│  └─ "Your appointment with Dr. Smith is tomorrow at 2:00 PM"
│
└─ 1 hour before: 1:00 PM (same day)
   └─ "Your appointment with Dr. Smith starts in 1 hour at 2:00 PM"
```

**Platform Support:**
- **Android:** Uses `flutter_local_notifications` with FCM integration
- **iOS:** Uses `flutter_local_notifications` with native support

**Features:**
- Timezone-aware scheduling
- Notification survives app restart
- Tap notification → Opens appointment details screen
- Sound and vibration enabled

**Tests:** `test/core/notifications/local_notification_service_test.dart`

---

## 4. WhatsApp Notifications (Twilio Integration)

### File: `lib/core/notifications/whatsapp_notification_service.dart`

**Purpose:** Send appointment updates via WhatsApp (patient action required).

**Key Methods:**

```dart
// Send WhatsApp confirmation when appointment is booked
Future<void> sendAppointmentConfirmation(AppointmentEntity appointment, String phoneNumber);

// Send reminder message 24h before
Future<void> sendAppointmentReminder(AppointmentEntity appointment, String phoneNumber);

// Send message when appointment is cancelled
Future<void> sendCancellationConfirmation(AppointmentEntity appointment, String phoneNumber);

// Send message when appointment is rescheduled
Future<void> sendRescheduleConfirmation(AppointmentEntity appointment, String phoneNumber);
```

**Backend API:**
```
POST /api/notifications/whatsapp
{
  "phoneNumber": "+919876543210",
  "messageType": "appointment_confirmation",
  "appointmentId": "appt_123",
  "data": {
    "doctorName": "Dr. Smith",
    "date": "2026-06-25",
    "time": "10:00",
    "clinicName": "City Hospital"
  }
}
```

**Message Templates:**
- `appointment_confirmation` - Booking confirmation
- `appointment_reminder` - 24h advance reminder
- `appointment_cancelled` - Cancellation notice
- `appointment_rescheduled` - New appointment time

**Cost:** ~₹0.18 per SMS (MSG91 gateway, DLT-registered)

**Tests:** `test/core/notifications/whatsapp_notification_service_test.dart`

---

## 5. Email Notifications (Resend Integration)

### File: `lib/core/notifications/email_notification_service.dart`

**Purpose:** Send professional email updates for appointments.

**Key Methods:**

```dart
// Send email confirmation when appointment is booked
Future<void> sendAppointmentConfirmation(AppointmentEntity appointment, String email);

// Send reminder email (24h or urgent 1h reminder)
Future<void> sendAppointmentReminder(AppointmentEntity appointment, String email, {required bool isUrgent});

// Send email when appointment is cancelled
Future<void> sendCancellationConfirmation(AppointmentEntity appointment, String email);

// Send email when appointment is rescheduled
Future<void> sendRescheduleConfirmation(AppointmentEntity appointment, String email);
```

**Backend API:**
```
POST /api/notifications/email
{
  "email": "patient@example.com",
  "templateId": "appointment_confirmation",
  "appointmentId": "appt_123",
  "data": {
    "doctorName": "Dr. Smith",
    "date": "2026-06-25",
    "time": "10:00",
    "clinicName": "City Hospital",
    "clinicAddress": "123 Main St"
  }
}
```

**Email Templates (via Resend):**
- `appointment_confirmation` - Professional booking confirmation
- `appointment_reminder` - Standard 24h reminder
- `appointment_reminder_urgent` - Bold 1h reminder
- `appointment_cancelled` - Cancellation confirmation
- `appointment_rescheduled` - New appointment details

**Cost:** Free (3k emails/month) or $20/mo for higher volume

**Tests:** `test/core/notifications/email_notification_service_test.dart`

---

## Integration: AppointmentNotifier

### File: `lib/features/appointments/presentation/notifiers/appointment_notifier.dart`

**Purpose:** Orchestrate all 5 services in appointment lifecycle.

**Methods:**

```dart
// Load appointments from API, cache with Hive
Future<void> fetchAppointments();

// Create appointment + schedule all notifications
Future<void> createAppointment(AppointmentEntity appointment);

// Cancel appointment + cancel reminders + send notifications
Future<void> cancelAppointment(String appointmentId);

// Reschedule appointment + update all notifications
Future<void> rescheduleAppointment(String appointmentId, DateTime newScheduledAt);
```

**Complete Flow Example:**

```dart
// Step 1: User books appointment
AppointmentEntity appointment = AppointmentEntity(
  id: 'appt_123',
  doctorName: 'Dr. Smith',
  scheduledAt: '2026-06-25T10:00:00Z',
  // ... other fields
);

// Step 2: AppointmentNotifier orchestrates all services
await appointmentNotifier.createAppointment(appointment);

// This triggers:
// 1. ✅ Local Notifications: Schedule 24h + 1h reminders
// 2. ✅ WhatsApp: Send confirmation via Twilio
// 3. ✅ Email: Send confirmation via Resend
// 4. ✅ Hive Cache: Store appointment locally
// 5. ✅ API: Refresh appointments list
```

---

## Complete Appointment Lifecycle

```
Patient Books Appointment
├─ Local: Schedule 24h reminder
├─ Local: Schedule 1h reminder
├─ WhatsApp: Send confirmation (+919876543210)
├─ Email: Send confirmation (patient@example.com)
├─ Hive: Cache in device storage
└─ API: Fetch latest appointments

24 Hours Before Appointment
├─ Device: Show local notification
└─ (WhatsApp/Email sent earlier if reminder flag set)

1 Hour Before Appointment
├─ Device: Show urgent local notification
├─ WhatsApp: Send urgent reminder (optional, backend)
└─ Email: Send urgent reminder (optional, backend)

Patient Cancels Appointment
├─ API: Update appointment status
├─ Local: Cancel both scheduled reminders
├─ WhatsApp: Send cancellation message
├─ Email: Send cancellation message
└─ Hive: Update cached appointment status

Patient Reschedules Appointment
├─ API: Create new appointment slot
├─ Local: Cancel old reminders
├─ Local: Schedule new 24h + 1h reminders
├─ WhatsApp: Send new appointment time
├─ Email: Send new appointment details
└─ Hive: Update cache with new time
```

---

## Offline Behavior

**Scenario: User is offline when appointment is created**

```
1. API call fails
2. Hive fallback: Show cached appointments
3. Local notifications: Still scheduled (device storage)
4. WhatsApp/Email: Queued, sent when network returns
```

**Scenario: User is offline when reminder triggers**

```
1. Device OS: Shows local notification anyway
2. User taps notification: App opens
3. If still offline: Shows cached appointment details
4. When online: Syncs with backend
```

---

## Test Coverage

| Feature | Tests | Coverage |
|---------|-------|----------|
| Firebase OTP | 4 | Phone verification, SMS code, token retrieval, sign out |
| Hive Cache | 8 | Caching, retrieval, clearing, offline fallback |
| Local Notifications | 6 | Scheduling, cancellation, payload, edge cases |
| WhatsApp | 7 | All message types, API contract, error handling |
| Email | 8 | All message types, templates, error handling |
| Integration | 7 | Complete flows, resilience, consistency |

**Run Tests:**
```bash
flutter test test/core/auth/firebase_auth_datasource_test.dart
flutter test test/core/storage/hive_cache_service_test.dart
flutter test test/core/notifications/local_notification_service_test.dart
flutter test test/core/notifications/whatsapp_notification_service_test.dart
flutter test test/core/notifications/email_notification_service_test.dart
flutter test test/integration/appointment_notifications_integration_test.dart
```

---

## Dependencies

**In pubspec.yaml:**

```yaml
# Firebase
firebase_core: ^3.3.0
firebase_auth: ^5.1.4

# Storage & Caching
hive: ^2.2.0
hive_flutter: ^1.1.0

# Notifications
flutter_local_notifications: ^17.0.0

# HTTP
dio: ^5.4.0

# Code Generation
hive_generator: ^2.0.0
build_runner: ^2.4.6
```

---

## Cost Breakdown (Monthly)

| Service | Cost | Volume | Notes |
|---------|------|--------|-------|
| Firebase OTP | Free | 10k SMS/mo | DLT-free |
| Hive Cache | Free | Unlimited | Device storage |
| Local Notifications | Free | Unlimited | Device-only |
| WhatsApp (MSG91) | ₹0.18/SMS | 3-4 per appointment | DLT-registered |
| Email (Resend) | Free | 3k emails/mo | Or $20/mo for more |
| **Total** | **~₹60** | 100 patients | At 1 appt/patient/month |

---

## Future Enhancements (Phase 2+)

1. **Firebase Messaging (FCM):** Replace device local notifications with backend-triggered FCM push
2. **BullMQ:** Add message queue for retry logic on failed notifications
3. **SMS via MSG91:** Direct SMS instead of WhatsApp for broader reach
4. **Notification Preferences:** Let patients choose WhatsApp/Email/SMS
5. **Analytics:** Track notification delivery rates and engagement
6. **A/B Testing:** Test different message templates for higher open rates

---

## Troubleshooting

**Local notifications not showing on Android?**
- Ensure app has `POST_NOTIFICATIONS` permission in `AndroidManifest.xml`
- Check notification channel is registered correctly

**WhatsApp messages not sending?**
- Verify phone number format: +91XXXXXXXXXX
- Check backend has MSG91 credentials configured
- Verify DLT templates are approved

**Email not arriving?**
- Check email address is valid
- Verify Resend API key in backend
- Check spam folder (whitelisting may be needed)

**Hive cache not loading?**
- Clear app cache: `adb shell pm clear com.huggi.patient`
- Regenerate Hive code: `flutter pub run build_runner build`

---

## Related Documentation

- [SPEC-001: Hospital Queue MVP](../../docs/specs/SPEC-001-Huggi-Hospital-Queue-MVP.md)
- [Firebase Setup Guide](../../docs/setup/firebase-setup.md)
- [Resend Email Templates](../../docs/templates/email-templates.md)
- [MSG91 DLT Registration](../../docs/compliance/dlt-registration.md)

---

**Last Updated:** 2026-06-21  
**Status:** ✅ All 5 features implemented and tested
