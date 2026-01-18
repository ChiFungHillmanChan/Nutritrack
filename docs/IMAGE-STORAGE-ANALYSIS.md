# Nutritrack Image Storage Analysis

> Last Updated: 2026-01-18
> Analysis Type: Mobile Industry Standards Compliance

## Executive Summary

Nutritrack implements basic image capture and local storage but **does not meet mobile industry standards** for image handling. Critical gaps include missing cloud storage, no image encryption, inadequate compression, and no cache management.

---

## 1. Current Implementation

### Image Capture

**Location:** `app/(tabs)/camera.tsx`

**Library:** `expo-image-picker` v17.0.10

```typescript
// Camera capture
const result = await ImagePicker.launchCameraAsync({
  mediaTypes: ['images'],
  quality: 0.8,      // 80% quality compression
  base64: true,      // Direct base64 encoding
});

// Gallery picker
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images'],
  quality: 0.8,
  base64: true,
});
```

### Image Storage Strategy

**Two-Tier Hybrid (Incomplete):**

| Tier | Storage | Status |
|------|---------|--------|
| Local | SQLite + File System | Implemented |
| Cloud | Supabase Storage | **NOT IMPLEMENTED** |

### Database Schema

```sql
CREATE TABLE food_logs (
  ...
  image_url TEXT,  -- Stores local file URI only (e.g., file://...)
  ...
);
```

---

## 2. AI Analysis Flow

### Image Processing Pipeline

```
User captures photo
        |
        v
expo-image-picker (quality: 0.8)
        |
        v
Base64 encoding [+33% size overhead]
        |
        v
AI Analysis --> Gemini Vision API
        |
        v
Nutrition Results stored in SQLite
        |
        v
Image URI stored in food_logs.image_url (local path)
        |
        v
Manual Supabase sync (metadata only, NOT images)
```

### Server-Side Validation

**Location:** `supabase/functions/analyze-food/index.ts`

```typescript
// Size validation
if (image_base64.length > 15_000_000) {  // ~10MB practical limit
  return { success: false, error: 'Image too large' };
}
```

---

## 3. Image Compression Analysis

| Stage | Compression | Status |
|-------|-------------|--------|
| Capture | Quality 0.8 (80%) | Implemented |
| Dimension reduction | None | **NOT IMPLEMENTED** |
| Format optimization | None | **NOT IMPLEMENTED** |
| Storage compression | None | **NOT IMPLEMENTED** |

### Issues

1. **No dimension validation** - Could capture 4K images (3840x2160)
2. **Base64 overhead** - Increases size by ~33%
3. **No aspect ratio enforcement** - ImagePreview uses 4:3 but not enforced
4. **No progressive encoding** - Standard JPEG only

---

## 4. Industry Standards Comparison

| Standard | MyFitnessPal | Cronometer | Yazio | Nutritrack |
|----------|--------------|------------|-------|------------|
| Cloud storage | Yes | Yes | Yes | **NO** |
| Dimension limit | 1024px | 1200px | 1024px | **None** |
| Image encryption | Yes | Yes | Partial | **NO** |
| Lazy loading | Yes | Yes | Yes | **NO** |
| Cache management | LRU | LRU | Custom | **None** |
| EXIF stripping | Yes | Yes | Yes | **NO** |

---

## 5. Compliance Checklist

| Requirement | Status | Priority |
|-------------|--------|----------|
| Image compression (quality) | PASS | - |
| Dimension reduction (max 1200px) | **FAIL** | High |
| Max file size validation | PARTIAL (server only) | Medium |
| Cloud backup | **FAIL** | Critical |
| Lazy loading for lists | **FAIL** | Medium |
| Cache management | **FAIL** | Medium |
| Image encryption at rest | **FAIL** | High |
| Secure deletion on log delete | **FAIL** | Medium |
| Memory management | PARTIAL | Low |
| EXIF data stripping | **FAIL** | Low |

---

## 6. Security Concerns

### Current Risks

| Risk | Severity | Details |
|------|----------|---------|
| Unencrypted images | HIGH | Images stored in plain text on device |
| No secure deletion | MEDIUM | Images remain after food log deleted |
| EXIF data exposure | LOW | Location/device info may be embedded |
| Memory leaks | MEDIUM | Base64 stored in React state |

### Privacy Implications

- Food photos may reveal medical conditions
- Meal timing reveals user patterns
- EXIF data contains location metadata
- Device backup may include unencrypted images

---

## 7. Recommended Implementation

### Image Compression Utility

Create `lib/image-compression.ts`:

```typescript
interface ImageValidation {
  maxSizeBytes: 5_000_000;      // 5MB
  maxWidth: 1200;
  maxHeight: 1200;
  allowedMimeTypes: ['image/jpeg', 'image/png'];
  quality: 0.8;
}

async function compressImage(uri: string): Promise<CompressedImage> {
  // 1. Validate dimensions
  // 2. Resize if needed
  // 3. Compress quality
  // 4. Strip EXIF data
  // 5. Return optimized image
}
```

### Supabase Storage Integration

Create `services/image-storage.ts`:

```typescript
async function uploadFoodImage(
  userId: string,
  foodLogId: string,
  imageBase64: string
): Promise<string> {
  const bucket = 'food-images';
  const path = `${userId}/${foodLogId}.jpg`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, decode(imageBase64), {
      contentType: 'image/jpeg',
      upsert: true,
    });

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
```

### Cache Management

Implement LRU cache with size limit:

```typescript
interface ImageCache {
  maxSize: 100_000_000;  // 100MB
  maxAge: 7 * 24 * 60 * 60 * 1000;  // 7 days

  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  prune(): Promise<void>;
}
```

---

## 8. Implementation Roadmap

### Phase 1: Critical (This Week)

1. **Add Supabase Storage bucket** for food images
2. **Implement upload on food log creation**
3. **Update food_logs.image_url** to store cloud URL

### Phase 2: Important (Next Sprint)

4. **Create image compression utility** with dimension validation
5. **Implement lazy loading** for food log lists
6. **Add EXIF stripping** before upload

### Phase 3: Enhancement (Before Launch)

7. **Add image encryption at rest** using expo-crypto
8. **Implement secure deletion** cascade
9. **Add cache management** with LRU eviction

### Phase 4: Optimization (Post-Launch)

10. **Implement progressive JPEG** encoding
11. **Add thumbnail generation** for lists
12. **Monitor and optimize** transmission sizes

---

## 9. Database Schema Update

### Current Schema

```sql
image_url TEXT  -- Local file URI
```

### Recommended Schema

```sql
image_local_uri TEXT,      -- Local cache path
image_cloud_url TEXT,      -- Supabase Storage URL
image_thumbnail_url TEXT,  -- Thumbnail for lists
image_synced_at TEXT,      -- Sync timestamp
image_size_bytes INTEGER,  -- For cache management
```

---

## 10. Supabase Storage Configuration

### Bucket Setup

```sql
-- Create bucket for food images
INSERT INTO storage.buckets (id, name, public)
VALUES ('food-images', 'food-images', false);

-- RLS Policy: Users can only access their own images
CREATE POLICY "Users can view own images"
ON storage.objects FOR SELECT
USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 11. Summary

| Category | Current | Target | Gap |
|----------|---------|--------|-----|
| Compression | 80% quality | 80% + dimension | Dimension limit |
| Cloud storage | None | Supabase Storage | Full implementation |
| Encryption | None | AES-256 | Full implementation |
| Cache | None | 100MB LRU | Full implementation |
| Lazy loading | None | Thumbnail + full | Full implementation |

**Estimated Effort:** 3-5 days for critical items, 2 weeks for full compliance.
