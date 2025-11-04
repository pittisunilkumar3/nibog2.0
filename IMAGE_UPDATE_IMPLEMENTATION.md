# Image Update Implementation

## Overview
Successfully implemented image update functionality for both event and game edit pages. When users update an image, the system now:
1. Uploads the new image file
2. Deletes the old image file from the filesystem
3. Updates the image record in the external API
4. Provides comprehensive error handling and user feedback

## What Was Implemented

### 1. New API Endpoints for Image Updates

#### Event Image Update Endpoint
- **Path**: `/api/eventimages/update`
- **Method**: POST
- **Purpose**: Updates existing event image records
- **External API**: `https://ai.nibog.in/webhook/nibog/eventimage/updated`
- **Payload**: 
  ```json
  {
    "event_id": 131,
    "image_url": "./upload/eventimages/eventimage_1757947801601_4538.png",
    "priority": 1,
    "is_active": true
  }
  ```
- **Response**: Array with updated image record including timestamps

#### Game Image Update Endpoint
- **Path**: `/api/gamesimage/update`
- **Method**: POST
- **Purpose**: Updates existing game image records
- **External API**: `https://ai.nibog.in/webhook/nibog/gamesimage/update`
- **Payload**:
  ```json
  {
    "game_id": 131,
    "image_url": "./upload/gameimages/gameimage_1757947801601_4538.png",
    "priority": 1,
    "is_active": true
  }
  ```
- **Response**: Array with updated image record including timestamps

#### File Deletion Endpoint
- **Path**: `/api/files/delete`
- **Method**: POST
- **Purpose**: Safely deletes image files from the filesystem
- **Security**: Only allows deletion of files in upload directories
- **Payload**:
  ```json
  {
    "filePath": "./upload/eventimages/old_image.png"
  }
  ```
- **Response**: Success status and deletion confirmation

### 2. Service Functions Added

#### Event Service (`services/eventService.ts`)
- `updateEventImage(eventId, imageUrl, priority, isActive)`: Updates event image record

#### Game Service (`services/babyGameService.ts`)
- `updateGameImage(gameId, imageUrl, priority, isActive)`: Updates game image record

#### File Utilities (`lib/fileUtils.ts`)
- `deleteFile(filePath)`: Safely deletes files with error handling
- `isSafeToDelete(filePath)`: Security validation for file paths
- `extractFilename(filePath)`: Utility for filename extraction

### 3. Enhanced Edit Pages

#### Event Edit Page (`app/admin/events/[id]/edit/page.tsx`)
- **Smart Update Logic**: Detects if existing images need updating or new ones need creating
- **File Cleanup**: Automatically deletes old image files before updating
- **Error Handling**: Graceful degradation if image operations fail
- **User Feedback**: Clear success/error messages

#### Game Edit Page (`app/admin/games/[id]/edit/page.tsx`)
- **Same Smart Logic**: Identical update flow as events
- **Consistent UX**: Matching user experience across both pages
- **Robust Error Handling**: Comprehensive error recovery

## Update Flow Process

### Step-by-Step Process:
1. **User Action**: User selects new image file in edit page
2. **Form Submission**: User clicks "Update Event/Game" button
3. **Data Update**: Event/Game data is updated first (ensures core data is saved)
4. **Image Upload**: New image file is uploaded to local directory
5. **Existing Check**: System fetches existing images for the event/game
6. **Conditional Logic**:
   - **If existing images found**:
     - Delete old image files from filesystem
     - Call update API to replace image record
   - **If no existing images**:
     - Call create API to add new image record
7. **User Feedback**: Show appropriate success/error messages

## Security Features

### File Deletion Security
- **Path Validation**: Only files in upload directories can be deleted
- **Allowed Paths**: 
  - `./upload/eventimages/`
  - `./upload/gamesimage/`
  - `./upload/gameimages/`
- **Directory Traversal Protection**: Prevents access to system files
- **Error Logging**: Comprehensive logging for security monitoring

### API Validation
- **Required Fields**: Validates event_id/game_id and image_url
- **Priority Range**: Ensures priority is between 1-10
- **File Type Validation**: Enforced on upload (JPG, PNG, GIF, WebP)
- **File Size Limits**: 5MB maximum file size
- **Input Sanitization**: Prevents injection attacks

## Error Handling

### Comprehensive Error Recovery
- **Partial Success**: Event/Game update succeeds even if image operations fail
- **Clear Messaging**: Users receive specific error descriptions
- **Safe Operations**: Old files only deleted after new upload succeeds
- **Graceful Degradation**: Missing files don't break the system
- **Retry Logic**: Users can retry image operations without re-entering data

### Error Scenarios Handled
1. **External API Unavailable**: Webhook endpoints down
2. **File System Issues**: Disk space, permissions, missing files
3. **Network Problems**: Connectivity issues during upload/update
4. **Invalid Files**: Wrong formats, oversized files
5. **Concurrent Access**: Multiple users editing same record

## Testing and Validation

### Functional Testing
- ✅ **Image Upload**: New images upload correctly
- ✅ **File Replacement**: Old images are deleted and replaced
- ✅ **API Integration**: External webhooks receive correct data
- ✅ **Error Recovery**: System handles failures gracefully
- ✅ **User Experience**: Clear feedback and intuitive flow

### Security Testing
- ✅ **Path Traversal**: Cannot delete files outside upload directories
- ✅ **Input Validation**: Malformed requests are rejected
- ✅ **File Type Validation**: Only allowed image types accepted
- ✅ **Size Limits**: Oversized files are rejected
- ✅ **Authentication**: Only authenticated admin users can update

## Benefits

### For Users
- **Seamless Experience**: Simple image replacement workflow
- **Clear Feedback**: Always know the status of operations
- **Error Recovery**: Can retry failed operations easily
- **Consistent Interface**: Same experience across events and games

### For System
- **Clean Filesystem**: Old images are automatically cleaned up
- **Data Consistency**: Image records stay synchronized
- **Resource Efficiency**: No accumulation of unused files
- **Maintainability**: Clear separation of concerns

### For Developers
- **Reusable Components**: File utilities can be used elsewhere
- **Comprehensive Logging**: Easy debugging and monitoring
- **Security by Design**: Built-in protection against common attacks
- **Extensible Architecture**: Easy to add more image types

## Future Enhancements

### Potential Improvements
- **Batch Operations**: Update multiple images at once
- **Image Optimization**: Automatic resizing and compression
- **CDN Integration**: Upload to cloud storage services
- **Version History**: Keep track of previous image versions
- **Bulk Management**: Admin tools for managing all images

## Impact

This implementation provides a complete, secure, and user-friendly image management system that:
- **Eliminates Manual Cleanup**: No more orphaned image files
- **Improves User Experience**: Simple, intuitive image replacement
- **Ensures Data Integrity**: Consistent image records across systems
- **Maintains Security**: Robust protection against common vulnerabilities
- **Enables Scalability**: Clean architecture for future enhancements
