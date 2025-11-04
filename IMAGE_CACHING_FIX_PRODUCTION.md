# Image Caching Fix for Production Deployment

## Problem
When images are uploaded in production, they are not visible until the application is rebuilt. This is caused by Next.js's aggressive caching strategy for static assets.

## Solution Implemented

### 1. Cache Revalidation in Upload Routes
Added `revalidatePath()` to both image upload routes to clear Next.js cache:

**Files Modified:**
- `app/api/eventimages/upload/route.ts`
- `app/api/gamesimage/upload/route.ts`

**Changes:**
```typescript
import { revalidatePath } from 'next/cache';

// After successful upload
revalidatePath('/admin/events', 'layout');
revalidatePath('/events', 'layout');
revalidatePath('/baby-olympics', 'layout');
```

### 2. Cache-Busting Headers
Added proper cache control headers to upload responses:

```typescript
{
  headers: {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  }
}
```

### 3. Timestamp-Based Cache Busting
Added timestamp to upload response for client-side cache busting:

```typescript
{
  success: true,
  path: relativePath,
  filename: filename,
  originalName: file.name,
  size: file.size,
  timestamp: timestamp // For cache busting
}
```

### 4. Image Serving API Route
Created `/api/serve-image` route for dynamic image serving with no-cache headers:

**File:** `app/api/serve-image/route.ts`

**Usage:**
```
GET /api/serve-image?path=./upload/eventimages/image.jpg
```

### 5. Next.js Configuration Updates
Updated `next.config.mjs` to:
- Set `minimumCacheTTL: 0` for images
- Include upload directory in production build
- Properly trace output files

### 6. Image Cache Buster Utility
Created utility functions in `lib/image-cache-buster.ts`:

**Functions:**
- `addCacheBuster(imageUrl, timestamp?)` - Adds cache-busting query param
- `removeCacheBuster(imageUrl)` - Removes cache-busting params
- `toAbsoluteImageUrl(path, baseUrl?)` - Converts relative to absolute URL
- `getCacheBustedImageUrl(imageUrl)` - Gets cache-busted URL for Next.js Image

**Usage Example:**
```typescript
import { getCacheBustedImageUrl } from '@/lib/image-cache-buster';

<Image 
  src={getCacheBustedImageUrl(event.image_url)} 
  alt={event.title}
/>
```

## How to Use

### For New Image Uploads
The system now automatically:
1. Uploads the image with a unique filename
2. Returns a timestamp in the response
3. Revalidates affected pages
4. Serves images with no-cache headers

### For Displaying Images
Use the cache buster utility when rendering images:

```typescript
import { getCacheBustedImageUrl } from '@/lib/image-cache-buster';

// In your component
const imageUrl = getCacheBustedImageUrl(event.image_url);

<Image src={imageUrl} alt="Event" width={500} height={300} />
```

### Alternative: Direct Serving
For images that need to bypass all caching:

```typescript
const imageUrl = `/api/serve-image?path=${encodeURIComponent(event.image_url)}`;
```

## Deployment Checklist

1. ✅ Update both upload routes with revalidatePath
2. ✅ Add cache-control headers to responses
3. ✅ Create image serving API route
4. ✅ Update next.config.mjs
5. ✅ Create cache-buster utility
6. ⏳ Update components to use cache-busted URLs (if needed)
7. ⏳ Test in production environment

## Testing in Production

1. **Upload a new image** in the admin panel
2. **Verify immediate visibility** without rebuild
3. **Check browser DevTools** - Network tab should show:
   - `Cache-Control: no-cache` headers
   - Query parameter with timestamp
4. **Test page revalidation** - Navigate away and back

## Additional Recommendations

### For Production Deployment on Vercel/Other Platforms:

1. **Environment Variables:**
   ```env
   NEXT_PUBLIC_BASE_URL=https://your-domain.com
   ```

2. **Ensure Upload Directory Persistence:**
   - On Vercel: Use external storage (S3, Cloudinary, etc.)
   - On VPS: Ensure upload folder is not cleared on deployment

3. **CDN Configuration:**
   - If using CDN, set appropriate cache headers
   - Consider purging CDN cache after uploads

## Files Changed

- ✅ `app/api/eventimages/upload/route.ts`
- ✅ `app/api/gamesimage/upload/route.ts`
- ✅ `app/api/serve-image/route.ts` (new)
- ✅ `next.config.mjs`
- ✅ `lib/image-cache-buster.ts` (new)

## Notes

- The timestamp-based approach ensures unique URLs for each deployment
- `revalidatePath` works in Next.js 14+ App Router
- For older Next.js versions, use `revalidateTag` instead
- Consider implementing image optimization service for production
- Monitor server storage and implement cleanup for old images

## Troubleshooting

**If images still don't appear:**

1. Check browser console for errors
2. Verify upload directory permissions
3. Check if files are actually being saved to disk
4. Verify the image path format matches expectations
5. Clear browser cache manually
6. Check if CDN/proxy is caching responses

**For persistence issues on serverless:**

Consider migrating to cloud storage:
- AWS S3
- Cloudinary
- UploadThing
- Vercel Blob Storage
