CREATE TABLE event_games_with_slots (
  id SERIAL PRIMARY KEY,  -- Use SERIAL for auto-incrementing in PostgreSQL
  event_id INTEGER NOT NULL,
  game_id INTEGER NOT NULL,  -- Referring to baby_games table
  custom_title VARCHAR(255),
  custom_description TEXT,
  custom_price DECIMAL(10, 2),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_price DECIMAL(10, 2),
  max_participants INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Automatically set the current timestamp when row is created
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Automatically set the current timestamp when row is created
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (game_id) REFERENCES baby_games(id)  -- Changed reference from games to baby_games
);



CREATE TABLE events (
  id SERIAL PRIMARY KEY,  -- Use SERIAL for auto-incrementing in PostgreSQL
  title VARCHAR(255) NOT NULL,
  description TEXT,
  city_id INT NOT NULL,  -- Assuming city_id is an INT, update accordingly if it's not
  venue_id INT NOT NULL,  -- Assuming venue_id is an INT, update accordingly if it's not
  event_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Created at timestamp
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Updated at timestamp
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (venue_id) REFERENCES venues(id)
);




CREATE TABLE baby_games (
  id SERIAL PRIMARY KEY,
  game_name VARCHAR(255) NOT NULL,
  description TEXT,
  min_age INT,
  max_age INT,
  duration_minutes INT,
  categories TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  city_name VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE venues (
  id SERIAL PRIMARY KEY,
  venue_name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city_id INT NOT NULL,
  capacity INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id)
);

CREATE TABLE employee (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    work_exp VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    father_name VARCHAR(255) NOT NULL,
    mother_name VARCHAR(255) NOT NULL,
    contact_no VARCHAR(255) NOT NULL,
    emeregency_contact_no VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    marital_status VARCHAR(255) NOT NULL,
    date_of_joining DATE NOT NULL,
    date_of_leaving DATE,
    local_address VARCHAR(255) NOT NULL,
    permanent_address VARCHAR(255) NOT NULL,
    note TEXT,
    image VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    gender VARCHAR(255) NOT NULL,
    acount_title VARCHAR(255) NOT NULL,
    bank_account_no VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    ifsc_code VARCHAR(255) NOT NULL,
    bank_branch VARCHAR(255) NOT NULL,
    payscale VARCHAR(255) NOT NULL,
    basic_salary VARCHAR(255) NOT NULL,
    epf_no VARCHAR(255) NOT NULL,
    contract_type VARCHAR(255) NOT NULL,
    shift varchar(255) NOT NULL,
    location varchar(255) NOT NULL,
    resume varchar(255) NOT NULL,
    joining_letter varchar(255) NOT NULL,
    resignation_letter varchar(255) NOT NULL,
    other_document_name varchar(255) NOT NULL,
    other_document_file varchar(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_superadmin BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    
);

CREATE TABLE social_media_settings (
    id SERIAL PRIMARY KEY,
    facebook_url TEXT NOT NULL DEFAULT 'https://www.facebook.com/share/1K8H6SPtR5/',
    instagram_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/nibog_100?igsh=MWlnYXBiNDFydGQxYg%3D%3D&utm_source=qr',
    linkedin_url TEXT NOT NULL DEFAULT 'https://www.linkedin.com/in/new-india-baby-olympicgames?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app',
    youtube_url TEXT NOT NULL DEFAULT 'https://youtube.com/@newindiababyolympics?si=gdXw5mGsXA93brxB',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_facebook_url CHECK (facebook_url LIKE 'https://%facebook.com/%'),
    CONSTRAINT chk_instagram_url CHECK (instagram_url LIKE 'https://%instagram.com/%'),
    CONSTRAINT chk_linkedin_url CHECK (linkedin_url LIKE 'https://%linkedin.com/%'),
    CONSTRAINT chk_youtube_url CHECK (youtube_url LIKE 'https://youtube.com/%')
);



CREATE TABLE general_settings (
    id SERIAL PRIMARY KEY,
    site_name TEXT NOT NULL,
    site_tagline TEXT NOT NULL,
    contact_email TEXT NOT NULL CHECK (contact_email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
    contact_phone TEXT NOT NULL,
    address TEXT NOT NULL,
    logo_path TEXT,
    favicon_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE email_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    smtp_host TEXT NOT NULL,
    smtp_port INTEGER NOT NULL CHECK (smtp_port > 0 AND smtp_port <= 65535),
    smtp_username TEXT NOT NULL,
    smtp_password TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL CHECK (sender_email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_smtp_host CHECK (smtp_host ~* '^[a-zA-Z0-9.-]+$')
);

## authentication


-- Enable essential extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- For cryptographic functions



-- Users table (main entity)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone VARCHAR(20) NOT NULL,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    password_hash TEXT,
    city_id INTEGER REFERENCES cities(city_id),  -- Changed to reference city_id
    accepted_terms BOOLEAN NOT NULL DEFAULT FALSE,
    terms_accepted_at TIMESTAMPTZ,
    
    -- Account status fields
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    locked_until TIMESTAMPTZ,
    deactivated_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
    CONSTRAINT valid_phone CHECK (phone ~ '^\+?[0-9]{10,15}$')
);




-- Indexes for users table
CREATE UNIQUE INDEX idx_users_email ON users(LOWER(email));
CREATE UNIQUE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(is_active, is_locked);

-- Google authentication
CREATE TABLE google_auth (
    google_auth_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    google_id VARCHAR(128) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Phone verification OTPs
CREATE TABLE phone_verification_otps (
    otp_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT numeric_code CHECK (code ~ '^[0-9]+$')
);

-- Email verification tokens
CREATE TABLE email_verification_tokens (
    token_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    token_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Login attempts tracking
CREATE TABLE login_attempts (
    attempt_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    attempt_type VARCHAR(20) NOT NULL CHECK (attempt_type IN ('password', 'otp', 'google')),
    successful BOOLEAN NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User sessions
CREATE TABLE user_sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log for security tracking
CREATE TABLE auth_audit_log (
    log_id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Timestamp update function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamps
CREATE TRIGGER update_user_modtime
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_google_auth_modtime
BEFORE UPDATE ON google_auth
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Function to validate at least one auth method exists
CREATE OR REPLACE FUNCTION validate_user_auth_method(user_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    has_password BOOLEAN;
    has_google BOOLEAN;
BEGIN
    SELECT password_hash IS NOT NULL INTO has_password FROM users WHERE users.user_id = validate_user_auth_method.user_id;
    SELECT EXISTS(SELECT 1 FROM google_auth WHERE google_auth.user_id = validate_user_auth_method.user_id) INTO has_google;
    
    RETURN has_password OR has_google;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce at least one auth method
CREATE OR REPLACE FUNCTION check_auth_method()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT validate_user_auth_method(NEW.user_id) THEN
        RAISE EXCEPTION 'User must have at least one authentication method (password or Google auth)';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER ensure_auth_method_exists
AFTER INSERT OR UPDATE ON users
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION check_auth_method();

CREATE CONSTRAINT TRIGGER ensure_auth_method_exists_google
AFTER INSERT OR UPDATE OR DELETE ON google_auth
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION check_auth_method();


CREATE TABLE parents (
    parent_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    parent_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    additional_phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_additional_phone CHECK (
        additional_phone IS NULL OR additional_phone ~ '^\+?[0-9]{10,15}$'
    ),
    CONSTRAINT valid_email CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);



CREATE TABLE children (
    child_id SERIAL PRIMARY KEY,
    parent_id INTEGER NOT NULL REFERENCES parents(parent_id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    date_of_birth DATE NOT NULL,
    school_name VARCHAR(200),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS bookings (
    booking_id SERIAL PRIMARY KEY,
    booking_ref VARCHAR(12) NOT NULL,
    user_id INTEGER NOT NULL,
    parent_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'Unpaid',
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);



CREATE TABLE booking_games (
    booking_game_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    child_id INTEGER NOT NULL REFERENCES children(child_id),
    game_id INTEGER NOT NULL REFERENCES baby_games(id),  -- Assumes baby_games is your game table
    game_price DECIMAL(10,2) NOT NULL,
    attendance_status VARCHAR(20) DEFAULT 'Registered'
        CHECK (attendance_status IN ('Registered', 'Attended', 'No_Show')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


## promo code
CREATE TABLE promo_codes (
    id SERIAL PRIMARY KEY,
    promo_code VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL, -- e.g., 'percentage', 'flat'
    value NUMERIC(10, 2) NOT NULL,
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP NOT NULL,
    usage_limit INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0, -- New column to track current usage
    minimum_purchase_amount NUMERIC(10, 2) DEFAULT 0,
    maximum_discount_amount NUMERIC(10, 2), -- as amount, not percent
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);


CREATE TABLE promo_code_mappings (
    id SERIAL PRIMARY KEY,
    promocodetable_id INTEGER REFERENCES promo_codes(id) ON DELETE CASCADE,
    event_id INTEGER,  -- Reference to your events table if it exists
    game_id INTEGER,   -- Reference to your games table if it exists
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Testimonials table
CREATE TABLE testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    testimonial TEXT,
    submitted_at DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) CHECK (status IN ('Published', 'Pending', 'Rejected')) DEFAULT 'Pending'
);


-- Add-ons table
CREATE TABLE addons (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category VARCHAR(20) CHECK (category IN ('meal', 'merchandise', 'service', 'other')) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    has_variants BOOLEAN DEFAULT false,
    stock_quantity INTEGER DEFAULT 0,
    sku TEXT UNIQUE NOT NULL,
    bundle_min_quantity INTEGER,
    bundle_discount_percentage NUMERIC(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add-on variants table
CREATE TABLE addon_variants (
    id SERIAL PRIMARY KEY,
    addon_id INTEGER REFERENCES addons(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_modifier NUMERIC(10, 2) DEFAULT 0, -- e.g., +₹20 or -₹10
    sku TEXT UNIQUE,
    stock_quantity INTEGER DEFAULT 0
);


-- Add-on images table
CREATE TABLE addon_images (
    id SERIAL PRIMARY KEY,
    addon_id INTEGER REFERENCES addons(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);

--- Payments table

CREATE TABLE payments (
  payment_id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(booking_id),
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  phonepe_transaction_id VARCHAR(100) UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'PhonePe',
  payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('successful', 'pending', 'failed', 'refunded')),
  payment_date TIMESTAMP,
  gateway_response JSONB,
  refund_amount DECIMAL(10,2) DEFAULT 0,
  refund_date TIMESTAMP,
  refund_reason TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


--- Pending Bookings table (for server-first payment approach)

CREATE TABLE pending_bookings (
  pending_booking_id SERIAL PRIMARY KEY,
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  booking_data JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_pending_bookings_transaction_id ON pending_bookings(transaction_id);
CREATE INDEX idx_pending_bookings_user_id ON pending_bookings(user_id);
CREATE INDEX idx_pending_bookings_status ON pending_bookings(status);
CREATE INDEX idx_pending_bookings_expires_at ON pending_bookings(expires_at);

--- Certificate Templates table



CREATE TABLE certificate_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('participation', 'winner', 'event_specific')),
    certificate_title VARCHAR(255), -- Certificate title that appears on the certificate
    background_image VARCHAR(500), -- File path URL (e.g., '/images/certificatetemplates/template_1_bg.jpg') - Legacy field
    background_style JSONB, -- New: Structured background options (type, colors, borders, etc.)
    paper_size VARCHAR(20) DEFAULT 'a4' CHECK (paper_size IN ('a4', 'letter', 'a3')),
    orientation VARCHAR(20) DEFAULT 'landscape' CHECK (orientation IN ('landscape', 'portrait')),
    fields JSONB NOT NULL, -- Store field configurations as JSON
    appreciation_text TEXT, -- Legacy: Dynamic appreciation message with placeholders
    appreciation_text_style JSONB, -- New: Structured appreciation text with positioning and styling
    signature_image VARCHAR(500), -- E-signature image URL
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--- Generated Certificates table

CREATE TABLE generated_certificates (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES certificate_templates(id),
    event_id INTEGER NOT NULL REFERENCES events(id),
    game_id INTEGER REFERENCES baby_games(id), -- Optional, for game-specific certificates
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    child_id INTEGER REFERENCES children(child_id), -- Optional, for child-specific certificates
    certificate_data JSONB NOT NULL, -- Store filled certificate data
    pdf_url VARCHAR(255), -- URL to generated PDF file
    status VARCHAR(50) DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'downloaded', 'failed')),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    downloaded_at TIMESTAMP
);

--- Indexes for performance

-- Indexes for certificate_templates
CREATE INDEX idx_certificate_templates_type ON certificate_templates(type);
CREATE INDEX idx_certificate_templates_active ON certificate_templates(is_active);

-- Indexes for generated_certificates
CREATE INDEX idx_generated_certificates_event ON generated_certificates(event_id);
CREATE INDEX idx_generated_certificates_user ON generated_certificates(user_id);
CREATE INDEX idx_generated_certificates_status ON generated_certificates(status);
CREATE INDEX idx_generated_certificates_template ON generated_certificates(template_id);

--- Booking Add-ons table

CREATE TABLE booking_addons (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL,
    addon_id INTEGER NOT NULL,
    variant_id INTEGER,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);





CREATE TABLE homepage_sections (
  id SERIAL PRIMARY KEY,
  image_path VARCHAR(255) NOT NULL,
  status VARCHAR(10) CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);





CREATE TABLE email_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL UNIQUE,
    default_subject VARCHAR(255),
    template_content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);





CREATE TABLE footer_settings (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    newsletter_enabled BOOLEAN DEFAULT TRUE,
    copyright_text TEXT
);




-- Terms & Conditions
CREATE TABLE terms_conditions (
    id SERIAL PRIMARY KEY,
    html_content TEXT NOT NULL,      -- full HTML content
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Privacy Policy
CREATE TABLE privacy_policy (
    id SERIAL PRIMARY KEY,
    html_content TEXT NOT NULL,      -- full HTML content
    created_at TIMESTAMPTZ DEFAULT now()
);



CREATE TABLE eventimage (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);



CREATE TABLE gamesimage (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);



CREATE TABLE testimonialimagestable (
    id SERIAL PRIMARY KEY,
    testimonial_id INTEGER NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);



