# EAS Testing Guide / EAS 測試指南

## English

### What is EAS Update?

EAS Update allows you to push JavaScript updates to your app without going through the App Store. However, **it requires a custom development build** - it does NOT work with Expo Go.

### Current Setup

| Item | Value |
|------|-------|
| Project ID | `766f4cfc-7488-487f-8dba-5c6977f55df1` |
| Owner | `hillmanchan709` |
| Branch | `preview` |
| Dashboard | https://expo.dev/accounts/hillmanchan709/projects/nutritrack |

---

### Testing Options

#### Option 1: Expo Go (Quick Testing - Requires Your Computer)

**Pros:** Fast, no build required  
**Cons:** Must keep terminal running, testers need Expo Go app

```bash
# Start development server with tunnel
npx expo start --tunnel
```

1. Share the QR code with testers
2. Testers install **Expo Go** from App Store
3. Scan QR code to open app
4. ⚠️ If you close terminal, app stops working

---

#### Option 2: Development Build (Recommended for Real Testing)

**Pros:** Works without your computer, more like real app  
**Cons:** Takes ~15-20 minutes to build, testers need to register devices

```bash
# Build for iOS internal testing
eas build --profile preview --platform ios
```

**After build completes:**
1. Go to https://expo.dev/accounts/hillmanchan709/projects/nutritrack/builds
2. Click on the build
3. Click "Install" to get the installation link
4. Share link with testers (they need to register their device UDID first)

**To push updates after initial build:**
```bash
eas update --branch preview --message "Your update message" --platform ios
```

---

#### Option 3: TestFlight (Professional Beta Testing)

**Pros:** Up to 10,000 testers, no UDID registration needed  
**Cons:** Requires Apple Developer account, Apple review (24-48 hours)

```bash
# Build for production/TestFlight
eas build --profile production --platform ios

# Submit to App Store Connect
eas submit --platform ios
```

---

### Quick Reference Commands

| Command | Description |
|---------|-------------|
| `npx expo start --tunnel` | Start dev server (share QR code) |
| `eas build --profile preview --platform ios` | Build for internal testing |
| `eas update --branch preview --platform ios` | Push update to testers |
| `eas build:list` | List all builds |
| `eas update:list` | List all updates |
| `eas whoami` | Check logged in account |

---

## 中文（廣東話）

### 咩係 EAS Update？

EAS Update 可以俾你推送 JavaScript 更新到你嘅 app，唔使經過 App Store。但係，**佢需要一個自訂開發版本** - 唔可以用 Expo Go。

### 目前設定

| 項目 | 數值 |
|------|------|
| Project ID | `766f4cfc-7488-487f-8dba-5c6977f55df1` |
| 擁有者 | `hillmanchan709` |
| 分支 | `preview` |
| 控制台 | https://expo.dev/accounts/hillmanchan709/projects/nutritrack |

---

### 測試選項

#### 選項 1：Expo Go（快速測試 - 需要你部電腦開住）

**優點：** 快，唔使 build  
**缺點：** 要保持 terminal 開住，測試者要裝 Expo Go app

```bash
# 啟動開發伺服器（用 tunnel）
npx expo start --tunnel
```

1. 分享 QR code 俾測試者
2. 測試者喺 App Store 安裝 **Expo Go**
3. 掃描 QR code 開啟 app
4. ⚠️ 如果你閂咗 terminal，app 就會停止運作

---

#### 選項 2：Development Build（推薦用嚟真正測試）

**優點：** 唔使你部電腦開住，更似真正嘅 app  
**缺點：** 要 ~15-20 分鐘 build，測試者要註冊裝置

```bash
# Build iOS 內部測試版
eas build --profile preview --platform ios
```

**Build 完成之後：**
1. 去 https://expo.dev/accounts/hillmanchan709/projects/nutritrack/builds
2. 撳個 build
3. 撳 "Install" 攞安裝連結
4. 分享連結俾測試者（佢哋要先註冊裝置 UDID）

**推送更新（第一次 build 之後）：**
```bash
eas update --branch preview --message "你嘅更新訊息" --platform ios
```

---

#### 選項 3：TestFlight（專業 Beta 測試）

**優點：** 最多 10,000 個測試者，唔使註冊 UDID  
**缺點：** 要 Apple Developer 帳戶，Apple 審核（24-48 小時）

```bash
# Build 生產版/TestFlight
eas build --profile production --platform ios

# 提交到 App Store Connect
eas submit --platform ios
```

---

### 快速參考指令

| 指令 | 描述 |
|------|------|
| `npx expo start --tunnel` | 啟動開發伺服器（分享 QR code） |
| `eas build --profile preview --platform ios` | Build 內部測試版 |
| `eas update --branch preview --platform ios` | 推送更新俾測試者 |
| `eas build:list` | 列出所有 builds |
| `eas update:list` | 列出所有更新 |
| `eas whoami` | 檢查登入咗邊個帳戶 |

---

## 測試者註冊裝置（Device Registration）

如果用 **Option 2 (Development Build)**，測試者要註冊佢哋嘅 iPhone：

1. 你發送註冊連結俾測試者：
   ```bash
   eas device:create
   ```
2. 測試者用 iPhone 開連結
3. 跟住指示安裝描述檔（profile）
4. 裝置會自動註冊

之後你就可以 build 一個包含佢哋裝置嘅版本。

---

## 常見問題 FAQ

### Q: 點解閂咗 terminal 之後 Expo Go 嘅 app 就停止？
**A:** 因為 Expo Go 係連接住你部電腦嘅開發伺服器。如果想 app 獨立運行，你要用 Development Build 或者 TestFlight。

### Q: EAS Update 可以用 Expo Go 嗎？
**A:** 唔可以。EAS Update 只可以用喺 Development Build 或者 Production Build。

### Q: Build 要幾耐？
**A:** iOS build 通常要 15-20 分鐘，視乎 EAS 伺服器繁忙程度。

### Q: 我可以俾幾多人測試？
**A:** 
- Expo Go：無限（但要你部電腦開住）
- Development Build (Internal)：最多 100 部裝置
- TestFlight：最多 10,000 人

---

## 下一步建議

1. **快速測試（自己用）**：用 `npx expo start --tunnel`
2. **俾朋友測試**：用 `eas build --profile preview --platform ios`
3. **正式 Beta 測試**：設定 TestFlight

有問題可以睇 [Expo 官方文檔](https://docs.expo.dev/eas-update/introduction/)
