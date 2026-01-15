# Nutritrack 🥗

營養攝取追蹤 App - 用 AI 幫你記錄同管理每日營養攝取

## 功能特點

- 📸 **AI 食物識別** - 影相即可自動識別食物同計算營養
- 📊 **營養儀表板** - 追蹤每日卡路里、蛋白質、碳水、脂肪攝取
- 🤖 **AI 營養師** - 隨時問營養相關問題，獲取個人化建議
- 🔔 **智能提醒** - 餐飲記錄、飲水、體重追蹤提醒
- 🎯 **個人化目標** - 根據你嘅身體狀況同目標自動計算每日目標

## 技術棧

| 層面 | 技術 |
|------|------|
| 前端 | Expo SDK 54 + React Native |
| 後端 | Supabase (PostgreSQL) |
| AI | Google Gemini 2.5 Flash / Pro |
| 認證 | Supabase Auth (Email + Google + Apple) |
| 狀態管理 | Zustand |

## 開始使用

### 1. 安裝依賴

```bash
npm install
```

### 2. 設置環境變數

複製 `env.example` 到 `.env.local` 並填入你嘅 credentials：

```bash
cp env.example .env.local
```

需要設置：
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase 項目 URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `GEMINI_API_KEY` - Google Gemini API key

### 3. 設置 Supabase

1. 建立 [Supabase](https://supabase.com) 項目
2. 執行 `supabase/migrations/001_initial_schema.sql` 建立數據庫結構
3. 在 Storage 建立 `food-images` private bucket

### 4. 啟動開發服務器

```bash
npm start
```

## 項目結構

```
nutritrack/
├── app/                    # Expo Router 頁面
│   ├── (auth)/            # 認證相關頁面
│   ├── (tabs)/            # 主要 Tab 頁面
│   └── _layout.tsx        # 根佈局
├── components/            # UI 組件
├── constants/             # 顏色、Typography 常數
├── lib/                   # AI Model 常數
├── services/              # API 服務
├── stores/                # Zustand 狀態管理
├── supabase/
│   ├── functions/         # Edge Functions
│   └── migrations/        # 數據庫遷移
└── types/                 # TypeScript 類型定義
```

## 發佈到 App Store / Google Play

### 1. 配置 EAS

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### 2. Build

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

### 3. Submit

```bash
# iOS
eas submit --platform ios

# Android
eas submit --platform android
```

## 安全考慮

- 所有 API keys 通過環境變數管理
- AI API calls 經 Supabase Edge Functions，key 唔會暴露喺 client
- 使用 Supabase Row Level Security (RLS) 確保用戶只能存取自己嘅數據
- Token 使用 `expo-secure-store` 安全儲存

## AI Model 使用

遵從 `.cursor/rules/01.ai-model-usage.mdc`：

- 所有 AI model 名稱集中喺 `lib/ai-models.ts`
- 唔好 hardcode model string
- Gemini API 需要處理 quota 錯誤

```typescript
import { AI_MODELS } from './lib/ai-models';

// ✅ 正確
model: AI_MODELS.GEMINI_2_5_FLASH

// ❌ 錯誤
model: 'gemini-2.5-flash'
```

## 授權

MIT License
