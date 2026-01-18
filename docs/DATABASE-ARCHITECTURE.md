# Nutritrack Database Architecture Analysis

> Last Updated: 2026-01-18
> Analysis Type: Apple App Store Standards Compliance

## Executive Summary

Nutritrack uses a **hybrid local-first architecture** with optional Supabase cloud synchronization. The app is built as a React Native/Expo cross-platform application (iOS, Android, Web) with SQLite as the local database engine and Supabase as the optional remote backend.

---

## 1. Database Infrastructure

### Local Storage: SQLite

**Location:** `services/database/`

| File | Purpose |
|------|---------|
| `database.ts` | SQLite connection singleton, foreign keys enabled |
| `migrations.ts` | Version-based schema migrations (v1, v2) |
| `repositories/` | Data access layer for each entity |

**Database Name:** `nutritrack.db`

**Key Features:**
- Singleton pattern for database connection
- Foreign key constraints enabled
- Automatic migration system on app startup
- Current schema version: 2

### Remote Storage: Supabase

**Location:** `services/supabase.ts`

**Configuration:**
- Supabase JS client v2.90.1
- Environment variables: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Supports **DEMO MODE** when credentials are not configured

**Authentication Storage:**
- Uses secure token storage adapter
- Platform-aware:
  - iOS/Android: `expo-secure-store` with Keychain/Keystore
  - Web: `localStorage`
- Handles chunked storage for tokens > 2048 bytes

---

## 2. Local SQLite Schema

### Tables Overview

| Table | Purpose | Encryption |
|-------|---------|-----------|
| `users` | User profile and health data | Partial (4 fields) |
| `food_logs` | Daily food intake tracking | No |
| `chat_messages` | AI chat history | No |
| `habit_logs` | Daily habits (hydration, mood, sleep) | No |
| `exercise_logs` | Physical activity tracking | No |
| `app_settings` | App-level configuration | No |
| `db_version` | Migration state tracking | No |

### Users Table Schema

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  gender TEXT,
  date_of_birth TEXT,
  height_cm REAL,
  weight_kg REAL,
  activity_level TEXT,
  goal TEXT,
  health_goals TEXT,           -- ENCRYPTED
  medical_conditions TEXT,     -- ENCRYPTED
  medications TEXT,            -- ENCRYPTED
  supplements TEXT,            -- ENCRYPTED
  allergies TEXT,              -- ENCRYPTED
  dietary_preferences TEXT,    -- JSON array
  daily_targets TEXT,          -- JSON nutrition targets
  notification_settings TEXT,  -- JSON
  is_demo_user INTEGER DEFAULT 0,
  onboarding_completed INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Food Logs Table Schema

```sql
CREATE TABLE food_logs (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  food_name TEXT NOT NULL,
  portion_size REAL NOT NULL,
  nutrition_data TEXT NOT NULL,  -- JSON with macro/micronutrients
  image_url TEXT,                -- Local file URI
  logged_at TEXT NOT NULL,
  ai_confidence REAL,
  synced_at TEXT,                -- For cloud sync (NOT IMPLEMENTED)
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_food_logs_user_date ON food_logs(user_id, logged_at);
```

### Chat Messages Table Schema

```sql
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,            -- 'user' | 'assistant'
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  synced_at TEXT,                -- For cloud sync (NOT IMPLEMENTED)
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, timestamp);
```

### Habit Logs Table Schema

```sql
CREATE TABLE habit_logs (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  habit_type TEXT NOT NULL,      -- mood, hydration, sleep_duration, bristol, etc.
  value TEXT NOT NULL,
  unit TEXT,
  notes TEXT,
  logged_at TEXT NOT NULL,
  synced_at TEXT,                -- For cloud sync (NOT IMPLEMENTED)
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_habit_logs_user_date ON habit_logs(user_id, logged_at);
CREATE INDEX idx_habit_logs_type ON habit_logs(user_id, habit_type, logged_at);
```

### Exercise Logs Table Schema

```sql
CREATE TABLE exercise_logs (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  exercise_type TEXT NOT NULL,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  distance_km REAL,
  steps INTEGER,
  avg_heart_rate INTEGER,
  source TEXT DEFAULT 'manual',  -- 'manual' | 'watch' | 'integration'
  logged_at TEXT NOT NULL,
  metadata TEXT,                 -- JSON for extra data
  synced_at TEXT,                -- For cloud sync (NOT IMPLEMENTED)
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_exercise_logs_user_date ON exercise_logs(user_id, logged_at);
```

---

## 3. Data Storage Classification

### Locally Stored (SQLite)

| Data Type | Repository | Encryption |
|-----------|-----------|-----------|
| User Profile | `userRepository.ts` | Sensitive fields only |
| Food Logs | `foodRepository.ts` | No |
| Chat History | `chatRepository.ts` | No |
| Habit Logs | `habitRepository.ts` | No |
| Exercise Logs | `exerciseRepository.ts` | No |
| App Settings | `settingsRepository.ts` | No |
| Auth Tokens | SecureStore | Yes (device keychain) |

### Remotely Stored (Supabase)

| Data Type | Status | Notes |
|-----------|--------|-------|
| User Profiles | Optional sync | Pulled from Supabase on login |
| Food Logs | **NOT IMPLEMENTED** | Has `synced_at` field but no sync code |
| Chat Messages | **NOT IMPLEMENTED** | Has `synced_at` field but no sync code |
| Habit Logs | **NOT IMPLEMENTED** | Has `synced_at` field but no sync code |
| Exercise Logs | **NOT IMPLEMENTED** | Has `synced_at` field but no sync code |

---

## 4. Repository Pattern

All repositories located in `services/database/repositories/`:

### userRepository.ts (436 lines)

| Function | Description |
|----------|-------------|
| `getUserById(id)` | Read user by ID |
| `getUserByEmail(email)` | Find user by email |
| `getDemoUser()` | Get/create demo user |
| `createUser(data)` | Create new user with encryption |
| `createUserWithId(id, data)` | Create with specific ID (social auth) |
| `updateUser(id, updates)` | Update user profile |
| `deleteUser(id)` | Delete user |
| `hasAnyUser()` | Check if any user exists |
| `getCurrentUser()` | Get logged-in user |

### foodRepository.ts (326 lines)

| Function | Description |
|----------|-------------|
| `getFoodLogsByDate(userId, date)` | Get logs for specific date |
| `getTodayFoodLogs(userId)` | Get today's logs |
| `createFoodLog(data)` | Create new food log |
| `calculateTotalNutrition(logs)` | Sum nutrition totals |
| `getUnsyncedFoodLogs(userId)` | For cloud sync (NOT CALLED) |

### chatRepository.ts (256 lines)

| Function | Description |
|----------|-------------|
| `getRecentChatMessages(userId, limit)` | Get recent messages |
| `getChatHistoryForAI(userId, limit)` | Get context for AI |
| `createChatMessage(data)` | Create new message |
| `clearChatHistory(userId)` | Delete all messages |

### habitRepository.ts (423 lines)

| Function | Description |
|----------|-------------|
| `getTodayHabitLog(userId, habitType)` | Get today's log for type |
| `getTodayHydration(userId)` | Get daily water total |
| `calculateStreak(userId, habitType)` | Calculate streak statistics |

### exerciseRepository.ts (412 lines)

| Function | Description |
|----------|-------------|
| `getTodayCaloriesBurned(userId)` | Get daily calorie total |
| `getTodaySteps(userId)` | Get daily step count |
| `getDailyActivitySummary(userId, date)` | Get aggregated summary |

### settingsRepository.ts (186 lines)

| Function | Description |
|----------|-------------|
| `getSetting<T>(key, defaultValue)` | Read setting |
| `setLoginState(isLoggedIn, userId)` | Auth state persistence |
| `clearAllUserData(userId)` | GDPR/deletion cascade |
| `getDatabaseStats(userId)` | Count records |

---

## 5. Critical Issues

### Issue 1: Cloud Sync Not Implemented

**Severity:** HIGH

**Evidence:**
- All repos have `getUnsyncedXxx()` and `markXxxSynced()` functions
- Every data table has `synced_at` field
- NO service actually calls these functions

**Impact:**
- Users' data exists ONLY locally
- Device switch = all data lost
- No cloud backup exists

**Recommendation:** Implement cloud sync service or document as local-only app.

### Issue 2: Incomplete Encryption

**Severity:** MEDIUM

**Current State:**
- Only 4 fields encrypted: medical_conditions, medications, supplements, allergies
- Unencrypted sensitive data: email, weight, height, activity_level, daily_targets, date_of_birth

**Recommendation:** Expand encryption to all health-related fields.

### Issue 3: SQLite File Unencrypted

**Severity:** HIGH

**Current State:**
- SQLite database file stored in plain text on device filesystem
- Physical device theft = full data access

**Recommendation:** Use `expo-sqlite/next` with encryption or `react-native-sql-cipher`.

---

## 6. Data Flow Diagrams

### Authentication Flow

```
User Input --> auth.ts (signIn/signUp/OAuth)
                    |
                    v
              Supabase Auth
                    |
                    v
            Supabase User Table
                    |
                    v (if Supabase available)
            SQLite users table
                    |
                    v
            userStore (Zustand)
                    |
                    v
            UI Components
```

### Data Persistence Flow

```
User Action (food log/chat/etc)
            |
            v
      Zustand Store Update
            |
            v
      Repository Function (createXxx)
            |
            v
      SQLite Database
            |
            v
      synced_at = NULL (marked unsynced)
            |
            v
      [SYNC NOT IMPLEMENTED]
```

### App Initialization Flow

```
App Start --> initializeDatabase() (migrations)
                    |
                    v
              getDatabase() (SQLite)
                    |
                    v
              userStore.initialize()
                    |
                    v
              Check: settingsRepository.isUserLoggedIn()
                    |
                    v (if true)
              Load: userRepository.getUserById(currentUserId)
                    |
                    v
              User available OFFLINE
```

---

## 7. Compliance Status

| Requirement | Status | Notes |
|-------------|--------|-------|
| Local data persistence | PASS | SQLite properly configured |
| Auth in secure storage | PASS | SecureStore for tokens |
| User profile local | PASS | SQLite users table |
| Chat history local | PASS | SQLite chat_messages table |
| Cloud sync for backup | FAIL | Infrastructure exists but not implemented |
| Database encryption | FAIL | SQLite file unencrypted |
| Full field encryption | PARTIAL | Only 4 of 12+ sensitive fields |

---

## 8. Recommendations

### Immediate Actions

1. **Encrypt SQLite database** using `react-native-sql-cipher`
2. **Implement cloud sync service** to call existing `getUnsyncedXxx()` functions
3. **Expand field encryption** to all health-related data

### Future Improvements

1. Add data export functionality for GDPR compliance
2. Implement conflict resolution for multi-device sync
3. Add database backup/restore functionality
