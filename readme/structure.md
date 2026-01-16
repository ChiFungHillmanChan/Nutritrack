# Nutritrack Project Structure

This document provides an overview of the project's components, utilities, and design system for quick reference and to prevent code duplication.

## Design System

### Constants (`/constants`)

| File | Purpose |
|------|---------|
| `colors.ts` | Color palette with COLORS, GRADIENTS, and SHADOWS objects |
| `typography.ts` | Typography system with TYPOGRAPHY, SPACING, and RADIUS constants |

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

## Screens

### Authentication (`/app/(auth)`)

| Screen | File | Purpose |
|--------|------|---------|
| Login | `login.tsx` | Email/password and social login |
| Register | `register.tsx` | Account creation with password validation |
| Onboarding | `onboarding.tsx` | Multi-step user profile setup |

### Main App (`/app/(tabs)`)

| Screen | File | Purpose |
|--------|------|---------|
| Home | `index.tsx` | Dashboard with daily nutrition summary |
| Camera | `camera.tsx` | Food photo capture and AI analysis |
| Chat | `chat.tsx` | AI nutritionist conversation interface |
| Settings | `settings.tsx` | User profile and app preferences |

## Stores (`/stores`)

| Store | File | Purpose |
|-------|------|---------|
| `useUserStore` | `userStore.ts` | User authentication and profile state |
| `useFoodStore` | `foodStore.ts` | Food logs and nutrition tracking state |

## Services (`/services`)

| Service | Purpose |
|---------|---------|
| `ai.ts` | AI functions using Gemini via Supabase Edge Functions (chat, food analysis) |
| `auth.ts` | Authentication functions (signIn, signUp, signOut) |
| `notifications.ts` | Push notification handling |
| `secure-storage.ts` | Secure token storage |
| `supabase.ts` | Supabase client configuration |

## Supabase Edge Functions (`/supabase/functions`)

| Function | Purpose |
|----------|---------|
| `chat/index.ts` | AI chat using Gemini 2.5 Pro for nutrition conversations |
| `analyze-food/index.ts` | Food image analysis using Gemini 2.5 Flash vision API |

## Usage Guidelines

### Using UI Components

```tsx
import {
  CircularProgress,
  Card,
  Button,
  NutritionBadge,
} from '@/components/ui';
```

### Using Design Tokens

```tsx
import { COLORS, SHADOWS, GRADIENTS } from '@/constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '@/constants/typography';
```

### Creating New Components

Before creating a new component:
1. Check this document for existing similar components
2. If creating, add entry to this structure.md
3. Place in appropriate directory based on usage scope
