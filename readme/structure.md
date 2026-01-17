# Nutritrack Project Structure

This document provides an overview of the project's components, utilities, and design system for quick reference and to prevent code duplication.

## Design System

### Constants (`/constants`)

| File | Purpose |
|------|---------|
| `colors.ts` | Color palette with COLORS, GRADIENTS, and SHADOWS objects (mint green theme) |
| `typography.ts` | Typography system with TYPOGRAPHY, SPACING, and RADIUS constants |
| `exercises.ts` | Exercise types and MET values for calorie calculations |
| `quotes.ts` | Daily motivational quotes and health tips with getTodayQuote() helper and language-aware getTodayLocalizedQuote() |

### UI Components (`/components/ui`)

| Component | File | Purpose |
|-----------|------|---------|
| `CircularProgress` | `CircularProgress.tsx` | Animated circular progress indicator for nutrition tracking |
| `MiniCircularProgress` | `CircularProgress.tsx` | Compact circular progress for inline displays |
| `Card` | `Card.tsx` | Standard card container with shadow variants |
| `GradientCard` | `Card.tsx` | Card with gradient background |
| `SectionCard` | `Card.tsx` | Card with title header and optional action |
| `Button` | `Button.tsx` | Primary button with gradient and animation support |
| `IconButton` | `Button.tsx` | Icon-only circular button |
| `ProgressBar` | `ProgressBar.tsx` | Linear progress bar with gradient support |
| `SegmentedProgressBar` | `ProgressBar.tsx` | Multi-segment progress bar |
| `NutritionBadge` | `NutritionBadge.tsx` | Nutrition stat display (calories, protein, carbs, fat, fiber) |
| `NutritionGrid` | `NutritionBadge.tsx` | Grid layout for multiple nutrition badges |
| `PieChart` | `PieChart.tsx` | Animated pie chart for nutrition visualization |
| `HorizontalProgressBar` | `HorizontalProgressBar.tsx` | Horizontal progress bars for nutrient display |
| `NutrientProgressBars` | `HorizontalProgressBar.tsx` | Preset nutrient bar configurations (carbs, protein, fiber, fat, sugar, fluids) |

### Chart Components (`/components/charts`)

| Component | File | Purpose |
|-----------|------|---------|
| `NutritionPieChart` | `NutritionPieChart.tsx` | Main pie chart for intake/output/net flow display |
| `TrendGraph` | `TrendGraph.tsx` | Weekly/monthly trend line graphs |
| `EnergyBalanceChart` | `EnergyBalanceChart.tsx` | Three-chart energy balance visualization |

### Habit Components (`/components/habits`)

| Component | File | Purpose |
|-----------|------|---------|
| `WeightTracker` | `WeightTracker.tsx` | Weight logging with historical graph |
| `HydrationTracker` | `HydrationTracker.tsx` | Water intake with glass visualization |
| `SleepTracker` | `SleepTracker.tsx` | Sleep duration and quality tracking |
| `MoodTracker` | `MoodTracker.tsx` | 5-point mood scale with emoji |
| `BowelTracker` | `BowelTracker.tsx` | Bristol stool scale tracker |
| `PeriodTracker` | `PeriodTracker.tsx` | Menstrual cycle tracking |
| `FiveADayTracker` | `FiveADayTracker.tsx` | Fruit/vegetable servings tracker |
| `HabitCard` | `HabitCard.tsx` | Generic habit display card |
| `StreakBadge` | `StreakBadge.tsx` | Habit streak display |

### Navigation Components (`/components/navigation`)

| Component | File | Purpose |
|-----------|------|---------|
| `HamburgerMenu` | `HamburgerMenu.tsx` | Slide-in drawer menu with extended functions |
| `HamburgerMenuButton` | `HamburgerMenu.tsx` | Button to trigger the hamburger menu |

### Home Components (`/components/home`)

| Component | File | Purpose |
|-----------|------|---------|
| `DailyQuote` | `DailyQuote.tsx` | Daily motivational quote/health tip display card |

### Profile Components (`/components/profile`)

| Component | File | Purpose |
|-----------|------|---------|
| `QuickActions` | `QuickActions.tsx` | Row of 5 quick action buttons (settings, notifications, feedback, theme, export) |
| `GoalsCard` | `GoalsCard.tsx` | User health goals with checkboxes and edit button |

### Timeline Components (`/components/timeline`)

| Component | File | Purpose |
|-----------|------|---------|
| `EntryCard` | `EntryCard.tsx` | Single timeline entry display (food, exercise, habit) |
| `CalendarView` | `CalendarView.tsx` | Monthly calendar for timeline navigation |
| `ListView` | `ListView.tsx` | Chronological list of timeline entries grouped by date |

### Settings Components (`/components/settings`)

| Component | File | Purpose |
|-----------|------|---------|
| `SettingRow` | `SettingRow.tsx` | Reusable settings list item with icon, label, value, and trailing element |
| `ProfileHeader` | `ProfileHeader.tsx` | User profile card with avatar, stats, and edit button |
| `LanguageSwitcher` | `LanguageSwitcher.tsx` | Language selection modal for switching between English and Traditional Chinese |

### Wellness Components (`/components/wellness`)

| Component | File | Purpose |
|-----------|------|---------|
| `AffirmationCard` | `AffirmationCard.tsx` | Daily affirmation display with sharing |
| `BreathingExercise` | `BreathingExercise.tsx` | Guided breathing exercise animation |
| `SoundPlayer` | `SoundPlayer.tsx` | Ambient sound player for meditation |
| `MeditationTimer` | `MeditationTimer.tsx` | Timer with gentle alerts |

## Screens

### Authentication (`/app/(auth)`)

| Screen | File | Purpose |
|--------|------|---------|
| Login | `login.tsx` | Email/password and social login |
| Register | `register.tsx` | Account creation with password validation |
| Onboarding | `onboarding.tsx` | 7-step user profile setup (basics, metrics, goals, conditions, medications, dietary, summary) |

### Main App (`/app/(tabs)`)

| Screen | File | Purpose |
|--------|------|---------|
| Home | `index.tsx` | Dashboard with circular progress, horizontal nutrient bars, daily quote, quick actions |
| Camera | `camera.tsx` | Food photo capture and AI analysis |
| Chat | `chat.tsx` | AI nutritionist conversation interface |
| Habits | `habits.tsx` | All habit trackers grid with quick-log |
| Profile | `settings.tsx` | User profile with quick actions, goals card, timeline link |

### Settings Screens (`/app`)

| Screen | File | Purpose |
|--------|------|---------|
| Profile Edit | `profile-edit.tsx` | Edit user profile (name, height, weight, goal, activity level) |
| About | `about.tsx` | App information, version, features, credits |
| Privacy Policy | `privacy-policy.tsx` | Privacy policy and data handling information |
| Timeline | `timeline.tsx` | View all entries in calendar or list format |
| Consultation | `consultation.tsx` | Book appointments with dietitians |
| Contact | `contact.tsx` | Contact information and feedback form |

### Tools (`/app/tools`)

| Screen | File | Purpose |
|--------|------|---------|
| Carb Counting | `carb-counting.tsx` | Carbohydrate counting calculator for common foods |
| Medications | `medications.tsx` | Manage medications and supplements |
| Portion Guide | `portion-guide.tsx` | Visual portion reference guide with hand comparison |
| Lifestyle Tips | `lifestyle-tips.tsx` | Health and lifestyle tips by category |
| Nutrition Facts | `nutrition-facts.tsx` | Educational content about nutrients |
| Exercise Guide | `exercise-guide.tsx` | Light exercise and stretching guides with steps |
| Insulin Calculator | `calculators/insulin-calculator.tsx` | Insulin dose calculator |
| Creon Calculator | `calculators/creon-calculator.tsx` | Pancreatic enzyme dosing |

### Wellness (`/app/wellness`)

| Screen | File | Purpose |
|--------|------|---------|
| Meditation | `meditation.tsx` | Meditation with ambient sounds |
| Affirmations | `affirmations.tsx` | Daily affirmations browser |

### Games (`/app/tools/games`)

| Screen | File | Purpose |
|--------|------|---------|
| Nutrition Quiz | `nutrition-quiz.tsx` | Educational nutrition quiz |
| Portion Match | `portion-match.tsx` | Portion size matching game |

## Stores (`/stores`)

| Store | File | Purpose |
|-------|------|---------|
| `useUserStore` | `userStore.ts` | User authentication, profile state, target calculations (SQLite persisted) |
| `useFoodStore` | `foodStore.ts` | Food logs and nutrition tracking state (SQLite persisted) |
| `useChatStore` | `chatStore.ts` | AI chat conversation history (SQLite persisted) |
| `useExerciseStore` | `exerciseStore.ts` | Exercise logs, steps, activity tracking |
| `useHabitStore` | `habitStore.ts` | Habit logs and streak tracking (SQLite persisted) |
| `useWellnessStore` | `wellnessStore.ts` | Meditation sessions, affirmations |

## Services (`/services`)

| Service | File | Purpose |
|---------|------|---------|
| `ai.ts` | `ai.ts` | AI functions using Gemini via Supabase Edge Functions |
| `auth.ts` | `auth.ts` | Authentication functions (signIn, signUp, signOut) |
| `i18n.ts` | `i18n.ts` | Internationalization service (i18n-js) with language detection and persistence |
| `notifications.ts` | `notifications.ts` | Push notification handling and scheduling |
| `secure-storage.ts` | `secure-storage.ts` | Secure token storage (sensitive data) |
| `supabase.ts` | `supabase.ts` | Supabase client configuration |
| `health-integration.ts` | `health-integration.ts` | Apple Health / Google Fit integration |

## Database (`/services/database`)

Local SQLite database for offline-first data persistence. Production-ready for iOS/Android App Store deployment.

### Core Files

| File | Purpose |
|------|---------|
| `database.ts` | SQLite connection singleton, initialization, helper functions |
| `migrations.ts` | Version-based schema migrations |
| `index.ts` | Main export for all database modules |

### Repositories (`/services/database/repositories`)

| Repository | File | Purpose |
|------------|------|---------|
| `userRepository` | `userRepository.ts` | User profile CRUD, demo user management |
| `foodRepository` | `foodRepository.ts` | Food logs CRUD, nutrition calculations |
| `chatRepository` | `chatRepository.ts` | Chat messages CRUD, welcome message |
| `habitRepository` | `habitRepository.ts` | Habit logs CRUD, streak calculations |
| `exerciseRepository` | `exerciseRepository.ts` | Exercise logs CRUD, activity summaries |
| `settingsRepository` | `settingsRepository.ts` | App settings persistence, data management, clear user data |

### Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User profiles (id, email, name, height, weight, goals, conditions, etc.) |
| `food_logs` | Food intake records with nutrition data |
| `chat_messages` | AI conversation history |
| `habit_logs` | All habit tracking data |
| `exercise_logs` | Exercise and activity records |
| `app_settings` | App preferences key-value store |
| `db_version` | Migration version tracking |

### Usage

```tsx
import { initializeDatabase, userRepository, foodRepository } from '@/services/database';

// Initialize on app start
await initializeDatabase();

// Use repositories
const user = userRepository.getDemoUser();
const todayLogs = foodRepository.getTodayFoodLogs(userId);
```

## Lib (`/lib`)

| Module | File | Purpose |
|--------|------|---------|
| `energy-calculator.ts` | `energy-calculator.ts` | BMR, TDEE, calorie calculations |
| `nutrition-calculator.ts` | `nutrition-calculator.ts` | Daily target calculations |
| `ai-models.ts` | `ai-models.ts` | AI model configuration |
| `ai-model-status.ts` | `ai-model-status.ts` | AI model availability check |

## Types (`/types`)

| Type Category | Purpose |
|---------------|---------|
| User Types | `User`, `Gender`, `ActivityLevel`, `HealthGoal`, `MedicalCondition`, `Medication`, `Supplement`, `DietaryPreference` |
| Food Types | `FoodLog`, `NutritionData`, `MealType` |
| Exercise Types | `ExerciseLog`, `ExerciseType`, `DailyActivity` |
| Habit Types | `HabitLog`, `HabitType`, `MoodLevel`, `BristolStoolType`, `SleepQuality`, `PeriodFlowLevel` |
| Wellness Types | `MeditationSession`, `Affirmation`, `AmbientSoundType`, `BreathingExerciseType` |
| Calculator Types | `InsulinCalculation`, `CreonCalculation` |
| Energy Types | `EnergyBalance` |
| Notification Types | `NotificationSettings`, `MedicationReminder`, `HabitReminder` |

## Supabase

### Edge Functions (`/supabase/functions`)

| Function | Purpose |
|----------|---------|
| `chat/index.ts` | AI chat using Gemini 2.5 Pro for nutrition conversations |
| `analyze-food/index.ts` | Food image analysis using Gemini 2.5 Flash vision API |

### Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User profiles with enhanced fields (gender, DOB, goals, conditions, medications) |
| `food_logs` | Food intake records with nutrition data |
| `weight_logs` | Weight tracking history |
| `exercise_logs` | Exercise and activity records |
| `habit_logs` | All habit tracking data |
| `meditation_sessions` | Meditation session history |
| `affirmations` | Affirmation content |
| `user_saved_affirmations` | User's saved affirmations |
| `portion_guides` | Portion reference data |
| `daily_activity_cache` | Cached daily step/activity data |
| `chat_history` | AI conversation history |
| `nutrition_facts` | Educational content |

## Usage Guidelines

### Using UI Components

```tsx
import {
  CircularProgress,
  Card,
  Button,
  NutritionBadge,
  PieChart,
} from '@/components/ui';
```

### Using Design Tokens

```tsx
import { COLORS, SHADOWS, GRADIENTS } from '@/constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '@/constants/typography';
```

### Using Stores

```tsx
import { useUserStore } from '@/stores/userStore';
import { useFoodStore } from '@/stores/foodStore';
import { useExerciseStore } from '@/stores/exerciseStore';
import { useHabitStore } from '@/stores/habitStore';
```

### Creating New Components

Before creating a new component:
1. Check this document for existing similar components
2. If creating, add entry to this structure.md
3. Place in appropriate directory based on usage scope
4. Follow naming conventions: PascalCase for components, camelCase for utilities

## Internationalization (`/locales`, `/hooks`)

### Localization Files (`/locales`)

| File | Purpose |
|------|---------|
| `en.ts` | English translations |
| `zh-TW.ts` | Traditional Chinese (繁體中文) translations |
| `index.ts` | Export all locale files |

### Hooks (`/hooks`)

| Hook | File | Purpose |
|------|------|---------|
| `useTranslation` | `useTranslation.ts` | React hook for accessing translations, setting language, and getting raw translation values |

### Usage

```tsx
import { useTranslation } from '@/hooks/useTranslation';

function MyComponent() {
  const { t, language, setLanguage, getRawTranslation } = useTranslation();
  
  // Basic translation
  const greeting = t('home.greeting', { name: 'John' });
  
  // Change language
  await setLanguage('zh-TW');
  
  // Get array or object from translations
  const tips = getRawTranslation('tools.lifestyleTips.categories.eating.tips');
}
```

### Supported Languages

- `en` - English
- `zh-TW` - Traditional Chinese (繁體中文)

### Adding Translations

1. Add keys to both `locales/en.ts` and `locales/zh-TW.ts`
2. Use `t('key.path')` in components
3. For interpolation: `t('key', { variable: value })`
4. For arrays, use `getRawTranslation('key')` and cast to appropriate type
