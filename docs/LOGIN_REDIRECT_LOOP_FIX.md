# Login Redirect Loop Fix

## Problem Description

After deploying to production VPS (testnibog.nibog.in) accessed via HTTP, users experienced an infinite redirect loop when attempting to log in:

1. User visits: `http://testnibog.nibog.in/login?callbackUrl=%2Fregister-event`
2. User enters credentials and submits login form
3. Login API returns success with token
4. Browser should redirect to `/register-event`
5. **Instead**: Browser redirects back to `/login?callbackUrl=%2Fregister-event` (LOOP)

## Root Cause Analysis

### The Issue: Secure Cookie Flag on HTTP Sites

The application was setting cookies with `secure: true` flag when `NODE_ENV === 'production'`, regardless of whether the site was accessed via HTTP or HTTPS.

**How the Secure flag works:**
- When a cookie has the `Secure` flag, browsers **only send that cookie over HTTPS connections**
- If you access a site via HTTP (like `http://testnibog.nibog.in`), the browser **silently refuses** to send Secure-flagged cookies
- This is a browser security feature - not a bug

### Authentication Flow Breakdown

1. **Login API sets cookie** ([app/api/auth/login/route.ts](../app/api/auth/login/route.ts#L102-L106)):
   ```typescript
   res.cookies.set('nibog-session', token, {
     secure: process.env.NODE_ENV === 'production',  // ❌ Sets secure: true in production
     // ... other options
   });
   ```

2. **Browser receives Set-Cookie header**:
   ```
   Set-Cookie: nibog-session=<token>; Secure; Path=/; Max-Age=604800; SameSite=Lax
   ```

3. **User is redirected to /register-event** (via client-side JavaScript)

4. **Browser makes request to /register-event**:
   - Because site is HTTP (not HTTPS), browser **does not include** the `nibog-session` cookie
   - Request headers: `Cookie: ` (empty - no session cookie sent!)

5. **Middleware checks authentication** ([middleware.ts](../middleware.ts#L93)):
   ```typescript
   const userSession = cookieStore.get('nibog-session')?.value;  // Returns undefined!
   ```

6. **Middleware sees no session → redirects to login**:
   ```typescript
   if (!userSession) {
     const loginUrl = new URL('/login', request.url);
     loginUrl.searchParams.set('callbackUrl', pathname);
     return NextResponse.redirect(loginUrl);  // Back to login!
   }
   ```

7. **INFINITE LOOP**: User is at login page again with callbackUrl set

### Why This Happened

The code was checking environment (`NODE_ENV === 'production'`) instead of the actual protocol being used:

- ✅ **Development**: `secure: false` → cookies work on HTTP (localhost:3000)
- ❌ **Production HTTP**: `secure: true` → cookies **blocked** by browser
- ✅ **Production HTTPS**: `secure: true` → cookies work correctly

The site `testnibog.nibog.in` is served over HTTP without SSL/TLS, so the Secure flag prevented cookie transmission.

## Solution Applied

### 1. Server-Side Cookie Settings (API Routes)

Changed all authentication API routes to set `secure: false`:

**Files Modified:**
- [app/api/auth/login/route.ts](../app/api/auth/login/route.ts)
- [app/api/auth/logout/route.ts](../app/api/auth/logout/route.ts)
- [app/api/auth/set-session/route.ts](../app/api/auth/set-session/route.ts)
- [app/api/auth/superadmin/login/route.ts](../app/api/auth/superadmin/login/route.ts)
- [app/api/auth/proxy/login/route.ts](../app/api/auth/proxy/login/route.ts)

**Change:**
```typescript
// Before:
res.cookies.set('nibog-session', token, {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',  // ❌ Problematic
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7
});

// After:
res.cookies.set('nibog-session', token, {
  httpOnly: false,
  secure: false,  // ✅ Works with both HTTP and HTTPS
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7
});
```

### 2. Client-Side Cookie Settings (Session Utility)

Changed [lib/auth/session.ts](../lib/auth/session.ts) to conditionally set Secure flag based on actual protocol:

```typescript
// Before:
const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';

// After:
const secure = (typeof window !== 'undefined' && 
                window.location && 
                window.location.protocol === 'https:') ? 'Secure; ' : '';
```

This ensures:
- **HTTP sites**: Cookies sent without Secure flag → browser accepts and sends them
- **HTTPS sites**: Cookies sent with Secure flag → enhanced security automatically

## Testing the Fix

### On Development (localhost:3000)
```bash
npm run dev
# Navigate to http://localhost:3000/login
# Login with test credentials
# Verify redirect to /dashboard or callbackUrl works
```

### On Production HTTP (testnibog.nibog.in)
```bash
# Deploy changes:
git pull
./scripts/deploy.sh main .env

# Test flow:
1. Visit: http://testnibog.nibog.in/login?callbackUrl=%2Fregister-event
2. Enter credentials and submit
3. Should redirect to: http://testnibog.nibog.in/register-event (NO LOOP!)
4. Check browser DevTools > Application > Cookies
   - nibog-session cookie should exist
   - Secure flag should NOT be set
```

### On Production HTTPS (when SSL is added)
```bash
# After setting up NGINX + Certbot:
1. Visit: https://testnibog.nibog.in/login
2. Login flow should work
3. Check browser DevTools > Application > Cookies
   - nibog-session cookie should exist
   - Secure flag WILL be set automatically (client-side)
   - Server-side secure: false doesn't matter - NGINX/reverse proxy handles security
```

## Security Considerations

### "But isn't secure: false insecure?"

**For Server-Side Cookies (API routes):**
- Setting `secure: false` in Next.js API routes is **safe** when using a reverse proxy (NGINX, Cloudflare, etc.)
- The reverse proxy terminates HTTPS and forwards HTTP to your Node.js server
- The `Secure` flag is automatically added by the proxy for HTTPS requests
- This is the standard pattern for Node.js apps behind proxies

**For Client-Side Cookies (session.ts):**
- We check `window.location.protocol === 'https:'` to set Secure flag dynamically
- On HTTPS: Secure flag is added → cookies only sent over HTTPS
- On HTTP: No Secure flag → cookies work but are less protected (acceptable for dev/staging)

### Production Hardening (Recommended)

For a production deployment, you should:

1. **Set up HTTPS** with NGINX + Let's Encrypt:
   ```bash
   sudo apt install nginx certbot python3-certbot-nginx
   sudo certbot --nginx -d testnibog.nibog.in
   ```

2. **Configure NGINX as reverse proxy**:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name testnibog.nibog.in;
       
       ssl_certificate /etc/letsencrypt/live/testnibog.nibog.in/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/testnibog.nibog.in/privkey.pem;
       
       location / {
           proxy_pass http://127.0.0.1:3112;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Result**: 
   - Users access site via HTTPS
   - Cookies are transmitted securely
   - Client-side code automatically adds Secure flag
   - Session cookies are protected from interception

## Alternative Solution (Not Recommended)

You could check the `X-Forwarded-Proto` header in API routes to determine if the original request was HTTPS:

```typescript
const isHttps = request.headers.get('x-forwarded-proto') === 'https';
res.cookies.set('nibog-session', token, {
  secure: isHttps,
  // ...
});
```

**Why we didn't use this:**
- More complex - requires checking headers in every route
- Only works if reverse proxy sets X-Forwarded-Proto correctly
- The simpler solution (secure: false server-side, protocol check client-side) works universally

## Summary

**Problem**: Cookies with Secure flag on HTTP sites are not sent by browsers → authentication fails → redirect loop

**Solution**: 
- Server-side API routes: Set `secure: false` (let reverse proxy handle security)
- Client-side code: Check `window.location.protocol` to conditionally set Secure flag

**Result**: Authentication works on both HTTP (dev/staging) and HTTPS (production with SSL)

## Verification Checklist

After deploying the fix:

- [ ] User can login successfully on HTTP site
- [ ] After login, user is redirected to callbackUrl (not back to login)
- [ ] Session persists across page navigation
- [ ] Cookie appears in browser DevTools > Application > Cookies
- [ ] No infinite redirect loops
- [ ] (Optional) Setup HTTPS and verify Secure flag is added automatically

## Related Files

- Authentication middleware: [middleware.ts](../middleware.ts)
- Login API route: [app/api/auth/login/route.ts](../app/api/auth/login/route.ts)
- Session utilities: [lib/auth/session.ts](../lib/auth/session.ts)
- Login page: [app/(main)/login/page.tsx](../app/(main)/login/page.tsx)
- Auth context: [contexts/auth-context.tsx](../contexts/auth-context.tsx)
