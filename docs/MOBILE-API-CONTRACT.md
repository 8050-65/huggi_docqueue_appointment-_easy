# Huggi Mobile API Contract
**Version:** 1.0  
**Base URL:** `https://<railway-domain>/api`  
**Local dev:** `http://localhost:3001/api`  
**OpenAPI JSON:** `/api/docs-json`  
**Swagger UI:** `/api/docs`

---

## Authentication

### Token types

| Token | Lifetime | Storage |
|---|---|---|
| Access token (JWT) | 15 minutes | In-memory / SecureStorage |
| Refresh token (opaque) | 7 days | SecureStorage |

The JWT payload contains:

```json
{
  "sub": "<userId>",
  "clinicId": "<clinicId or null>",
  "roles": [],
  "isSuperAdmin": false,
  "isPatient": true,
  "patientId": "<patientId>"
}
```

For patient tokens: `isPatient: true`, `roles: []`, `clinicId` is populated.

### Authorization header

All `[AUTH]` endpoints require:

```
Authorization: Bearer <access_token>
```

### Token refresh

When a 401 is received, call `POST /api/auth/refresh` with the stored refresh token.  
On success replace both tokens. On failure (401 again) the refresh token has expired — send the user back to OTP login.

---

## Patient Authentication Flow

```
1. User enters phone number in Flutter UI
2. Firebase Phone Auth SDK sends OTP SMS (Firebase, not MSG91)
3. User enters OTP → Firebase SDK returns firebaseIdToken
4. POST /api/auth/patient/login  { idToken: firebaseIdToken }
5. Server verifies token with Firebase Admin SDK
6. Server looks up pre-registered patient by phone number
7. Server returns { accessToken, refreshToken }
8. Store tokens in FlutterSecureStorage
```

**Pre-condition:** The patient must already be registered by clinic staff (`POST /api/patients`) before login will succeed.

---

## Endpoints Used by the Flutter Patient App

### 1. Patient Login

```
POST /api/auth/patient/login
Content-Type: application/json

{
  "idToken": "<Firebase ID token>"
}
```

**Response 200:**
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<opaque string>"
}
```

**Error 401:** Phone not registered as a patient.  
**Error 404:** No user found for this phone number.

---

### 2. Refresh Token

```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<opaque string>"
}
```

**Response 200:**
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<new opaque string>"
}
```

Refresh tokens are rotated on every use.

---

### 3. Logout

```
POST /api/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refreshToken": "<opaque string>"
}
```

**Response 200:** `{ "message": "Logged out" }`

---

### 4. Get My Appointments

```
GET /api/appointments/mine
Authorization: Bearer <access_token>
```

Returns the authenticated patient's appointments, ordered by time ascending.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "appointmentTime": "2026-06-15T10:30:00.000Z",
    "status": "booked",
    "notes": null,
    "clinicId": "uuid",
    "doctor": {
      "id": "uuid",
      "specialization": "General",
      "user": { "id": "uuid", "name": "Dr. Mehta" }
    }
  }
]
```

**Appointment statuses:** `booked`, `cancelled`, `done`

---

### 5. Get My Queue Position

```
GET /api/queue/my-position
Authorization: Bearer <access_token>
```

Returns the patient's active queue entry for today, or `null` if not in queue.

**Response 200 (in queue):**
```json
{
  "queueId": "uuid",
  "position": 3,
  "status": "waiting",
  "calledAt": null,
  "consultationStartedAt": null,
  "appointment": {
    "id": "uuid",
    "appointmentTime": "2026-06-15T10:30:00.000Z",
    "doctor": {
      "id": "uuid",
      "user": { "id": "uuid", "name": "Dr. Mehta" }
    }
  }
}
```

**Response 200 (not in queue):** `null`

**Queue statuses:**

| Status | Meaning |
|---|---|
| `waiting` | Waiting for turn, has a position number |
| `called` | Staff has called the patient |
| `in_consultation` | Currently with the doctor |
| `done` | Consultation complete |
| `no_show` | Missed appointment |

**Polling:** Poll this endpoint every 5–10 seconds to update the UI. Show position count to user.

---

## RBAC Summary

| Endpoint | Who can call |
|---|---|
| `POST /auth/patient/login` | Anyone (public) |
| `POST /auth/refresh` | Anyone (public) |
| `GET /appointments/mine` | Patient JWT (`isPatient: true`) |
| `GET /queue/my-position` | Patient JWT (`isPatient: true`) |
| `POST /auth/logout` | Any authenticated user |
| All other endpoints | Staff JWT with required role |

---

## Error Response Shape

All errors follow the standard NestJS format:

```json
{
  "statusCode": 404,
  "message": "No registered patient found for this phone number.",
  "error": "Not Found"
}
```

| Status | Meaning |
|---|---|
| 400 | Validation error (check `message` array) |
| 401 | Expired/invalid token — refresh and retry |
| 403 | Correct token, wrong role or wrong clinic |
| 404 | Resource not found |
| 409 | Conflict (double booking, duplicate phone) |
| 500 | Server error — contact support |

---

## Flutter Integration Notes

### SecureStorage keys
```dart
const kAccessToken  = 'huggi_access_token';
const kRefreshToken = 'huggi_refresh_token';
```

### Request headers
```dart
final headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer $accessToken',
};
```

### 401 Intercept (Dio interceptor pattern)
1. On 401, check if the request URL is `/auth/refresh` — if so, log out (refresh expired).
2. Otherwise call `POST /auth/refresh` with stored refresh token.
3. On success: store new tokens, retry original request once.
4. On failure: clear tokens, navigate to login screen.

### Firebase Phone Auth dependency
Add to `pubspec.yaml`:
```yaml
firebase_core: ^3.x
firebase_auth: ^5.x
```

---

## Environment Config

```
HUGGI_API_BASE_URL=https://<railway-domain>/api   # prod
HUGGI_API_BASE_URL=http://10.0.2.2:3001/api       # Android emulator
HUGGI_API_BASE_URL=http://localhost:3001/api       # iOS simulator
```

Android emulator maps `10.0.2.2` to the host machine's localhost.

---

## CORS Behaviour

The API allows `null` Origin (no `Origin` header), so direct HTTP calls from Flutter work on all platforms without CORS errors. CORS only applies to browser-based clients.
