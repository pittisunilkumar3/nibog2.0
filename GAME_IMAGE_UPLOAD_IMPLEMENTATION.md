# Game Image Upload Implementation

## Overview
Successfully implemented image upload functionality for game creation that uploads images to `./upload/gamesimage/` directory and sends them to the external webhook API after successful game creation.

## What Was Implemented

### 1. Directory Structure
- Created `./upload/gamesimage/` directory for storing game images
- Images are saved with unique filenames: `gameimage_{timestamp}_{random}.{extension}`

### 2. API Endpoints

#### Game Image Upload Endpoint
- **Path**: `/api/gamesimage/upload`
- **Method**: POST
- **Purpose**: Handles image file uploads to the gamesimage directory
- **Features**:
  - File type validation (JPG, PNG, GIF, WebP)
  - File size validation (5MB limit)
  - Unique filename generation
  - Returns upload result with path and metadata

#### Game Image Webhook Endpoint
- **Path**: `/api/gamesimage/webhook`
- **Method**: POST
- **Purpose**: Sends image data to external webhook
- **External API**: `https://ai.nibog.in/webhook/nibog/gamesimage/create`
- **Payload Format**:
  ```json
  {
    "game_id": 456,
    "image_url": "./upload/gamesimage/gameimage_123456789_123.jpg",
    "priority": 1,
    "is_active": true
  }
  ```

### 3. Service Functions
Updated `services/babyGameService.ts` with:
- `uploadGameImage(file: File)`: Uploads image to gamesimage directory
- `sendGameImageToWebhook(gameId, imageUrl, priority, isActive)`: Sends image data to external webhook

### 4. UI Updates
Modified `app/admin/games/new/page.tsx`:
- Added image file selection with validation
- Added priority input field (1-10, default: 1)
- Updated UI to show "Image selected" status before upload
- Modified form submission to handle image upload after successful game creation

### 5. Game Creation Flow
The new flow works as follows:
1. User fills out game form and selects an image file
2. User sets image priority (1-10)
3. User clicks "Save Game Template"
4. Game is created successfully and returns game ID (handles both `{id: ...}` and `{game_id: ...}` response formats)
5. If image was selected:
   - Image is uploaded to `./upload/gamesimage/`
   - Image data is sent to external webhook with game ID
   - Success/error messages are shown accordingly

## API Response Format
The external webhook returns:
```json
[
  {
    "id": 3,
    "game_id": 456,
    "image_url": "./upload/gamesimage/gameimage_123456789_123.jpg",
    "priority": 1,
    "is_active": true,
    "created_at": "2025-09-15T10:40:11.102Z",
    "updated_at": "2025-09-15T10:40:11.102Z"
  }
]
```

## Testing
- Created comprehensive test script (`test-game-image-flow.js`)
- Verified game image upload functionality works correctly
- Verified webhook integration works with external API
- Confirmed images are saved to correct directory with proper naming

## Files Modified/Created

### New Files:
- `app/api/gamesimage/upload/route.ts` - Game image upload API
- `app/api/gamesimage/webhook/route.ts` - Game image webhook API
- `test-game-image-flow.js` - Test script
- `upload/gamesimage/` - Directory for storing game images

### Modified Files:
- `app/admin/games/new/page.tsx` - Updated UI and game creation flow
- `services/babyGameService.ts` - Added new service functions

## Usage Instructions
1. Navigate to `http://localhost:3111/admin/games/new`
2. Fill out the game form (name, description, age range, duration, categories)
3. Select an image file (JPG, PNG, GIF, WebP, max 5MB)
4. Set the image priority (1-10, where 1 is highest priority)
5. Click "Save Game Template"
6. The system will:
   - Create the game
   - Upload the image to `./upload/gamesimage/`
   - Send image data to the external webhook
   - Show success/error messages

## Error Handling
- File type validation with user-friendly error messages
- File size validation (5MB limit)
- Network error handling for both upload and webhook calls
- Graceful degradation: game creation succeeds even if image upload fails
- Detailed error logging for debugging

## Security Features
- File type validation to prevent malicious uploads
- File size limits to prevent abuse
- Unique filename generation to prevent conflicts
- Server-side validation for all inputs

## Comparison with Event Images
Both implementations follow the same pattern:
- **Events**: Upload to `./upload/eventimages/` → webhook to `/webhook/nibog/eventimage`
- **Games**: Upload to `./upload/gamesimage/` → webhook to `/webhook/nibog/gamesimage/create`
- Both use the same validation, error handling, and flow structure
