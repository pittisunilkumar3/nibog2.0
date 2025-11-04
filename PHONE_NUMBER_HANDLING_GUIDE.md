# Phone Number Handling Guide for NIBOG

## Summary of Current Implementation

After analyzing the codebase, here's how phone numbers are handled in the NIBOG platform:

## 📱 Phone Number Storage

### Database Schema
- **Field Type**: `VARCHAR(20)`
- **Format**: Phone numbers are stored **WITH the country code prefix** (e.g., `+916303727148`)
- **Examples**:
  - ✅ Correct: `+916303727148` (Indian number with +91 prefix)
  - ✅ Correct: `+919876543210`
  - ❌ Incorrect: `6303727148` (missing country code)
  - ❌ Incorrect: `916303727148` (missing + symbol)

### Validation Rules
- Must include country code
- Should start with `+` symbol
- Length: 10-15 digits after country code
- Format: `+[country code][phone number]`

## 📲 WhatsApp Message Sending

### Current Implementation (from `services/whatsappService.ts`)

The system uses the **Zaptra WhatsApp API** with the following phone number handling:

```typescript
function formatPhoneNumber(phone: string): string | null {
  if (!phone) return null;
  
  // Remove all non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Handle Indian numbers
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    return `+${cleanPhone}`;  // Returns: +916303727148
  } else if (cleanPhone.length === 10) {
    return `+91${cleanPhone}`;  // Adds +91 prefix
  } else if (cleanPhone.startsWith('+')) {
    return phone; // Already formatted
  }
  
  // For other international numbers
  if (cleanPhone.length >= 10) {
    return `+${cleanPhone}`;
  }
  
  return null;
}
```

### WhatsApp API Requirements

**✅ MUST USE +91 PREFIX** for Indian numbers when sending WhatsApp messages via Zaptra API.

#### Example WhatsApp Request Body:
```json
{
  "token": "YOUR_ZAPTRA_TOKEN",
  "phone": "+916303727148",  // ← MUST include +91
  "message": "Your message here"
}
```

### Important Notes

1. **Storage Format**: `+916303727148` (with +91)
2. **WhatsApp Sending**: `+916303727148` (with +91)
3. **No conversion needed** if stored correctly

## 🔍 Key Points

### ✅ DO:
- Store phone numbers **WITH +91 prefix** in database
- Send WhatsApp messages **WITH +91 prefix**
- Validate phone format before saving
- Use the `formatPhoneNumber()` function for consistency

### ❌ DON'T:
- Store phone numbers without country code
- Remove the +91 prefix when sending WhatsApp messages
- Use phone numbers without the `+` symbol

## 🚨 Common Issues

### Issue: `message_wamid` is null in WhatsApp response
**Causes**:
1. Phone number format is incorrect
2. Phone number doesn't have +91 prefix
3. Number is not opted-in to WhatsApp Business
4. Invalid phone number

**Solution**:
```typescript
// Always ensure phone has +91 prefix
const formattedPhone = formatPhoneNumber(userPhone);
// Result: +916303727148
```

### Issue: Error #132000 from Zaptra
**Cause**: Template parameter mismatch
**Solution**: Ensure all 8 template parameters are provided when using template messages

## 📝 Best Practices

1. **On User Registration**:
   ```typescript
   // Format phone before storing
   const formattedPhone = formatPhoneNumber(inputPhone);
   // Store: +916303727148
   ```

2. **When Sending WhatsApp**:
   ```typescript
   // Phone is already formatted from DB
   await sendBookingConfirmationWhatsApp({
     parentPhone: user.phone,  // Already has +91
     // ... other data
   });
   ```

3. **Input Validation**:
   - Accept: `6303727148` → Convert to `+916303727148`
   - Accept: `+916303727148` → Use as-is
   - Accept: `916303727148` → Convert to `+916303727148`

## 🔧 Code References

- **WhatsApp Service**: `/services/whatsappService.ts`
- **Phone Formatting**: `formatPhoneNumber()` function
- **Database Schema**: `/schema/core-schema.md`
- **Contact Form**: `/app/(main)/contact/page.tsx`

## 📞 Contact Page Update

✅ **Completed**: Removed "Frequently Asked Questions" section from the contact page as requested.

---

**Last Updated**: October 14, 2025
**Status**: Active Implementation
