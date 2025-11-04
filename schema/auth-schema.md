# Authentication Schema - NIBOG Platform

This file contains the database schema for authentication and authorization related entities for the NIBOG Platform.

## Authentication Tokens

The `auth_tokens` table stores authentication tokens for users.

```sql
CREATE TABLE auth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    token_type VARCHAR(20) NOT NULL CHECK (token_type IN ('access', 'refresh', 'reset_password', 'verify_email', 'verify_phone')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    device_info JSONB
);

-- Index for faster lookups
CREATE INDEX idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX idx_auth_tokens_token_type ON auth_tokens(token_type);
CREATE INDEX idx_auth_tokens_expires_at ON auth_tokens(expires_at);
CREATE INDEX idx_auth_tokens_is_revoked ON auth_tokens(is_revoked);
```

## OTP Codes

The `otp_codes` table stores one-time password codes for phone verification and login.

```sql
CREATE TABLE otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('login', 'registration', 'verify_phone', 'reset_password')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    attempt_count INTEGER DEFAULT 0
);

-- Index for faster lookups
CREATE INDEX idx_otp_codes_phone ON otp_codes(phone);
CREATE INDEX idx_otp_codes_code ON otp_codes(code);
CREATE INDEX idx_otp_codes_purpose ON otp_codes(purpose);
CREATE INDEX idx_otp_codes_expires_at ON otp_codes(expires_at);
CREATE INDEX idx_otp_codes_is_used ON otp_codes(is_used);
```

## Social Logins

The `social_logins` table stores information about users who have logged in using social providers.

```sql
CREATE TABLE social_logins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('google', 'facebook', 'apple')),
    provider_user_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(255),
    provider_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(provider, provider_user_id)
);

-- Index for faster lookups
CREATE INDEX idx_social_logins_user_id ON social_logins(user_id);
CREATE INDEX idx_social_logins_provider ON social_logins(provider);
CREATE INDEX idx_social_logins_provider_user_id ON social_logins(provider_user_id);
```

## User Sessions

The `user_sessions` table stores information about user sessions.

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

## Password Reset Requests

The `password_reset_requests` table stores information about password reset requests.

```sql
CREATE TABLE password_reset_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45)
);

-- Index for faster lookups
CREATE INDEX idx_password_reset_requests_user_id ON password_reset_requests(user_id);
CREATE INDEX idx_password_reset_requests_token ON password_reset_requests(token);
CREATE INDEX idx_password_reset_requests_expires_at ON password_reset_requests(expires_at);
CREATE INDEX idx_password_reset_requests_is_used ON password_reset_requests(is_used);
```

## Email Verification Requests

The `email_verification_requests` table stores information about email verification requests.

```sql
CREATE TABLE email_verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster lookups
CREATE INDEX idx_email_verification_requests_user_id ON email_verification_requests(user_id);
CREATE INDEX idx_email_verification_requests_email ON email_verification_requests(email);
CREATE INDEX idx_email_verification_requests_token ON email_verification_requests(token);
CREATE INDEX idx_email_verification_requests_expires_at ON email_verification_requests(expires_at);
CREATE INDEX idx_email_verification_requests_is_used ON email_verification_requests(is_used);
```

## User Permissions

The `permissions` table stores available permissions in the system.

```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Roles

The `roles` table stores user roles in the system.

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Role Permissions

The `role_permissions` table associates permissions with roles.

```sql
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- Index for faster lookups
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
```

## User Roles

The `user_roles` table associates roles with users.

```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- Index for faster lookups
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
```

## Login Attempts

The `login_attempts` table tracks failed login attempts for security purposes.

```sql
CREATE TABLE login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255),
    phone VARCHAR(20),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    attempt_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE,
    failure_reason VARCHAR(100)
);

-- Index for faster lookups
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_phone ON login_attempts(phone);
CREATE INDEX idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_attempt_time ON login_attempts(attempt_time);
```

## Guest Tokens

The `guest_tokens` table stores temporary access tokens for guest users (non-registered users).

```sql
CREATE TABLE guest_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    phone VARCHAR(20),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45)
);

-- Index for faster lookups
CREATE INDEX idx_guest_tokens_token ON guest_tokens(token);
CREATE INDEX idx_guest_tokens_email ON guest_tokens(email);
CREATE INDEX idx_guest_tokens_phone ON guest_tokens(phone);
CREATE INDEX idx_guest_tokens_booking_id ON guest_tokens(booking_id);
CREATE INDEX idx_guest_tokens_expires_at ON guest_tokens(expires_at);
```

## API Keys

The `api_keys` table stores API keys for external integrations.

```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    key_value VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permissions JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster lookups
CREATE INDEX idx_api_keys_key_value ON api_keys(key_value);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX idx_api_keys_expires_at ON api_keys(expires_at);
```

## Rate Limiting

The `rate_limits` table stores rate limiting information for API endpoints.

```sql
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address VARCHAR(45) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER DEFAULT 1,
    first_request_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_request_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ip_address, endpoint)
);

-- Index for faster lookups
CREATE INDEX idx_rate_limits_ip_address ON rate_limits(ip_address);
CREATE INDEX idx_rate_limits_endpoint ON rate_limits(endpoint);
CREATE INDEX idx_rate_limits_last_request_at ON rate_limits(last_request_at);
```

## Functions and Triggers

### Token Generation Function

This function generates a secure random token.

```sql
CREATE OR REPLACE FUNCTION generate_secure_token(length INTEGER DEFAULT 32)
RETURNS VARCHAR AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result VARCHAR := '';
    i INTEGER := 0;
    chars_length INTEGER := length(chars);
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * chars_length) + 1, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;
```

### OTP Generation Function

This function generates a numeric OTP code.

```sql
CREATE OR REPLACE FUNCTION generate_otp(length INTEGER DEFAULT 6)
RETURNS VARCHAR AS $$
DECLARE
    chars TEXT := '0123456789';
    result VARCHAR := '';
    i INTEGER := 0;
    chars_length INTEGER := length(chars);
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * chars_length) + 1, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;
```

### Clean Expired Tokens Function

This function cleans up expired tokens.

```sql
CREATE OR REPLACE FUNCTION clean_expired_tokens()
RETURNS VOID AS $$
BEGIN
    -- Delete expired auth tokens
    DELETE FROM auth_tokens WHERE expires_at < CURRENT_TIMESTAMP;
    
    -- Delete expired OTP codes
    DELETE FROM otp_codes WHERE expires_at < CURRENT_TIMESTAMP;
    
    -- Delete expired password reset requests
    DELETE FROM password_reset_requests WHERE expires_at < CURRENT_TIMESTAMP;
    
    -- Delete expired email verification requests
    DELETE FROM email_verification_requests WHERE expires_at < CURRENT_TIMESTAMP;
    
    -- Delete expired guest tokens
    DELETE FROM guest_tokens WHERE expires_at < CURRENT_TIMESTAMP;
    
    -- Delete expired user sessions
    DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
```

### Scheduled Token Cleanup

Set up a scheduled job to clean up expired tokens.

```sql
-- This can be set up as a cron job or using PostgreSQL's pg_cron extension
-- Example using pg_cron:
-- CREATE EXTENSION pg_cron;
-- SELECT cron.schedule('0 * * * *', 'SELECT clean_expired_tokens()');
```
