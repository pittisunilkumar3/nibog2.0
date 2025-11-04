# Bulk Email Functionality Documentation

## Overview
The bulk email functionality allows administrators to send personalized emails to multiple recipients by uploading CSV or Excel files containing recipient data.

## Features
- **Sample Template Download**: Download CSV or Excel templates with proper formatting
- **File Validation**: Comprehensive validation for file structure and email formats
- **Progress Tracking**: Real-time progress tracking during email sending
- **Error Handling**: Detailed error reporting for invalid emails or file formats
- **Batch Processing**: Efficient processing with rate limiting to prevent server overload

## Accessing the Feature
Navigate to `http://localhost:3111/admin/email` and select the "Bulk Email" tab.

## How to Use

### Step 1: Download Sample Template
1. Click either "Download CSV" or "Download Excel" button
2. The template includes sample data with the following columns:
   - `name`: Recipient's full name
   - `email`: Recipient's email address (required)
   - `company`: Company name
   - `phone`: Phone number
   - `custom_field1`: Custom field for personalization
   - `custom_field2`: Additional custom field

### Step 2: Prepare Your Data
1. Open the downloaded template
2. Replace sample data with your recipient information
3. Ensure all email addresses are valid
4. Save the file as CSV or XLSX format

### Step 3: Upload and Send
1. Click "Upload CSV/XLSX" and select your prepared file
2. The system will validate the file and show any issues
3. Customize the email subject and body using placeholders like `{{name}}`, `{{email}}`
4. Preview the first 10 rows to verify data
5. Click "Send Bulk Emails" to start the process

## File Format Requirements

### Required Columns
- **email**: Must contain valid email addresses

### Recommended Columns
- **name**: For personalized greetings

### Optional Columns
- Any additional columns can be used as placeholders in email content

### File Limits
- Maximum 100 recipients per batch (for performance)
- Supported formats: CSV, XLSX

## Email Template Variables
Use these placeholders in your email subject and body:
- `{{name}}`: Recipient's name
- `{{email}}`: Recipient's email
- `{{company}}`: Company name
- `{{phone}}`: Phone number
- `{{custom_field1}}`: Custom field 1
- `{{custom_field2}}`: Custom field 2
- Any column name from your file can be used as `{{column_name}}`

## Validation and Error Handling

### File Validation
- Checks for required email column
- Validates email format using regex
- Warns about missing recommended columns
- Limits file size for performance

### Email Validation
- Invalid emails are highlighted in red in the preview
- System prevents sending if invalid emails are detected
- Detailed error messages for each validation issue

### Progress Tracking
- Real-time progress bar during email sending
- Success/failure count tracking
- Detailed logging for debugging

## API Endpoints

### Sample Template Downloads
- **CSV Template**: `GET /api/bulk-email/sample-template`
- **Excel Template**: `GET /api/bulk-email/sample-template/excel`

### Logging
- **Log Activity**: `POST /api/bulk-email/log`
- **Get Logs**: `GET /api/bulk-email/log`

## Technical Implementation

### Frontend Components
- Enhanced `BulkEmailUploader` component
- File validation and error display
- Progress tracking with visual feedback
- Template download functionality

### Backend APIs
- Sample template generation and serving
- Enhanced logging with session tracking
- File validation and processing
- Integration with existing email system

### File Processing
- Uses `xlsx` library for Excel file parsing
- Comprehensive validation logic
- Error handling and user feedback
- Rate limiting to prevent server overload

## Security Considerations
- File size limits to prevent DoS attacks
- Email validation to prevent spam
- Rate limiting on email sending
- Input sanitization for all user data

## Troubleshooting

### Common Issues
1. **"Required email column not found"**: Ensure your file has a column named 'email'
2. **"Invalid emails detected"**: Check email format (must be valid email addresses)
3. **"File validation failed"**: Download a fresh template and follow the format exactly
4. **Upload fails**: Ensure file is in CSV or XLSX format and under size limits

### Best Practices
1. Always test with a small batch first
2. Use the sample template as a starting point
3. Verify email addresses before uploading
4. Keep batches under 100 recipients for best performance
5. Use meaningful placeholder names in your email content

## Future Enhancements
- Database integration for log persistence
- Advanced scheduling options
- Email template library integration
- Enhanced analytics and reporting
- Support for attachments in bulk emails

## Support
For technical support or feature requests, contact the development team or create an issue in the project repository.