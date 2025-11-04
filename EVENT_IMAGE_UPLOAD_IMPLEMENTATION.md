# Event Image Upload Implementation

## Overview
Successfully implemented image upload functionality for event creation that uploads images to `./upload/eventimages/` directory and sends them to the external webhook API after successful event creation.

## What Was Implemented

### 1. Directory Structure
- Created `./upload/eventimages/` directory for storing event images
- Images are saved with unique filenames: `eventimage_{timestamp}_{random}.{extension}`

### 2. API Endpoints

#### Image Upload Endpoint
- **Path**: `/api/eventimages/upload`
- **Method**: POST
- **Purpose**: Handles image file uploads to the eventimages directory
- **Features**:
  - File type validation (JPG, PNG, GIF, WebP)
  - File size validation (5MB limit)
  - Unique filename generation
  - Returns upload result with path and metadata

#### Webhook Endpoint
- **Path**: `/api/eventimages/webhook`
- **Method**: POST
- **Purpose**: Sends image data to external webhook
- **External API**: `https://ai.nibog.in/webhook/nibog/eventimage`
- **Payload Format**:
  ```json
  {
    "event_id": 123,
    "image_url": "./upload/eventimages/eventimage_123456789_123.jpg",
    "priority": 1,
    "is_active": true
  }
  ```

### 3. Service Functions
Updated `services/eventService.ts` with:
- `uploadEventImage(file: File)`: Uploads image to eventimages directory
- `sendEventImageToWebhook(eventId, imageUrl, priority, isActive)`: Sends image data to external webhook

### 4. UI Updates
Modified `app/admin/events/new/page.tsx`:
- Added image file selection with validation
- Added priority input field (1-10, default: 1)
- Updated UI to show "Image selected" status before upload
- Modified form submission to handle image upload after successful event creation

### 5. Event Creation Flow
The new flow works as follows:
1. User fills out event form and selects an image file
2. User sets image priority (1-10)
3. User clicks "Create Event"
4. Event is created successfully and returns event ID (handles both `{id: ...}` and `{event_id: ...}` response formats)
5. If image was selected:
   - Image is uploaded to `./upload/eventimages/`
   - Image data is sent to external webhook with event ID
   - Success/error messages are shown accordingly

## Recent Fix
- **Issue**: Event creation API returns `{success: 'true', event_id: 130}` but code was looking for `createdEvent.id`
- **Solution**: Updated event ID extraction to handle both `event_id` and `id` fields: `const eventId = createdEvent?.event_id || createdEvent?.id`
- **Result**: Now works with your API response format

## API Response Format
The external webhook returns:
```json
[
  {
    "id": 2,
    "event_id": 123,
    "image_url": "./upload/eventimages/eventimage_123456789_123.jpg",
    "priority": 1,
    "is_active": true,
    "created_at": "2025-09-15T08:24:01.024Z",
    "updated_at": "2025-09-15T08:24:01.024Z"
  }
]
```

## Testing
- Created comprehensive test script (`test-event-image-flow.js`)
- Verified image upload functionality works correctly
- Verified webhook integration works with external API
- Confirmed images are saved to correct directory with proper naming

## Files Modified/Created

### New Files:
- `app/api/eventimages/upload/route.ts` - Image upload API
- `app/api/eventimages/webhook/route.ts` - Webhook API
- `test-event-image-flow.js` - Test script
- `upload/eventimages/` - Directory for storing images

### Modified Files:
- `app/admin/events/new/page.tsx` - Updated UI and event creation flow
- `services/eventService.ts` - Added new service functions

## Usage Instructions
1. Navigate to `http://localhost:3111/admin/events/new`
2. Fill out the event form (title, description, venue, date, games)
3. Select an image file (JPG, PNG, GIF, WebP, max 5MB)
4. Set the image priority (1-10, where 1 is highest priority)
5. Click "Create Event"
6. The system will:
   - Create the event
   - Upload the image to `./upload/eventimages/`
   - Send image data to the external webhook
   - Show success/error messages

## Error Handling
- File type validation with user-friendly error messages
- File size validation (5MB limit)
- Network error handling for both upload and webhook calls
- Graceful degradation: event creation succeeds even if image upload fails
- Detailed error logging for debugging

## Security Features
- File type validation to prevent malicious uploads
- File size limits to prevent abuse
- Unique filename generation to prevent conflicts
- Server-side validation for all inputs
