# Core Schema - NIBOG Platform

This file contains the core database schema for the NIBOG Platform, including the main entities like Users, Children, Events, Venues, and Bookings.

## Users

The `users` table stores information about registered users of the platform.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    default_city_id UUID REFERENCES cities(id),
    profile_picture_url VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_city ON users(default_city_id);
```

## Children

The `children` table stores information about children profiles created by users.

```sql
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_children_user_id ON children(user_id);
CREATE INDEX idx_children_dob ON children(dob);
```

## Cities

The `cities` table stores information about cities where events are held.

```sql
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_cities_name ON cities(name);
CREATE INDEX idx_cities_active ON cities(is_active);
```

## Venues

The `venues` table stores information about venues where events are held.

```sql
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INTEGER,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    facilities JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_venues_city_id ON venues(city_id);
CREATE INDEX idx_venues_active ON venues(is_active);
```

## Game Templates

The `game_templates` table stores information about different types of games that can be organized.

```sql
CREATE TABLE game_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    min_age_months INTEGER NOT NULL,
    max_age_months INTEGER NOT NULL,
    default_price DECIMAL(10, 2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    capacity_per_slot INTEGER NOT NULL,
    rules TEXT,
    equipment_needed TEXT,
    category VARCHAR(100),
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_age_range CHECK (min_age_months <= max_age_months)
);

-- Index for faster lookups
CREATE INDEX idx_game_templates_age ON game_templates(min_age_months, max_age_months);
CREATE INDEX idx_game_templates_category ON game_templates(category);
CREATE INDEX idx_game_templates_active ON game_templates(is_active);
```

## Events

The `events` table stores information about scheduled events.

```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    venue_id UUID NOT NULL REFERENCES venues(id),
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    registration_start_date DATE NOT NULL,
    registration_end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    featured BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_time_range CHECK (start_time < end_time),
    CONSTRAINT check_registration_dates CHECK (registration_start_date <= registration_end_date AND registration_end_date <= event_date)
);

-- Index for faster lookups
CREATE INDEX idx_events_venue_id ON events(venue_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_featured ON events(featured);
```

## Event Games

The `event_games` table associates games with events and stores game-specific details for an event.

```sql
CREATE TABLE event_games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    game_template_id UUID NOT NULL REFERENCES game_templates(id),
    custom_price DECIMAL(10, 2),
    custom_capacity INTEGER,
    custom_duration_minutes INTEGER,
    custom_rules TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, game_template_id)
);

-- Index for faster lookups
CREATE INDEX idx_event_games_event_id ON event_games(event_id);
CREATE INDEX idx_event_games_game_template_id ON event_games(game_template_id);
CREATE INDEX idx_event_games_active ON event_games(is_active);
```

## Game Slots

The `game_slots` table stores information about time slots for games within events.

```sql
CREATE TABLE game_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_game_id UUID NOT NULL REFERENCES event_games(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INTEGER NOT NULL,
    booked_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'full', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_slot_time_range CHECK (start_time < end_time),
    CONSTRAINT check_capacity CHECK (capacity > 0),
    CONSTRAINT check_booked_count CHECK (booked_count >= 0)
);

-- Index for faster lookups
CREATE INDEX idx_game_slots_event_game_id ON game_slots(event_game_id);
CREATE INDEX idx_game_slots_status ON game_slots(status);
```

## Bookings

The `bookings` table stores information about user bookings for event game slots.

```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    child_id UUID NOT NULL REFERENCES children(id),
    game_slot_id UUID NOT NULL REFERENCES game_slots(id),
    price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    promo_code_id UUID REFERENCES promo_codes(id),
    status VARCHAR(20) DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'confirmed', 'cancelled', 'completed', 'no_show')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    attended BOOLEAN DEFAULT FALSE,
    attendance_marked_at TIMESTAMP WITH TIME ZONE,
    ticket_url VARCHAR(255),
    certificate_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_amounts CHECK (price >= 0 AND discount >= 0 AND discount <= price AND total_amount = price - discount)
);

-- Index for faster lookups
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_child_id ON bookings(child_id);
CREATE INDEX idx_bookings_game_slot_id ON bookings(game_slot_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
```

## Booking Add-ons

The `booking_addons` table stores information about add-ons purchased with bookings.

```sql
CREATE TABLE booking_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    addon_id UUID NOT NULL REFERENCES addons(id),
    addon_variant_id UUID REFERENCES addon_variants(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    collected BOOLEAN DEFAULT FALSE,
    collected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_quantity CHECK (quantity > 0),
    CONSTRAINT check_addon_prices CHECK (unit_price >= 0 AND total_price = unit_price * quantity)
);

-- Index for faster lookups
CREATE INDEX idx_booking_addons_booking_id ON booking_addons(booking_id);
CREATE INDEX idx_booking_addons_addon_id ON booking_addons(addon_id);
CREATE INDEX idx_booking_addons_collected ON booking_addons(collected);
```

## Payments

The `payments` table stores information about payments for bookings.

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    transaction_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_gateway VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'successful', 'failed', 'refunded')),
    gateway_response JSONB,
    refund_amount DECIMAL(10, 2) DEFAULT 0,
    refund_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_payment_amount CHECK (amount > 0),
    CONSTRAINT check_refund_amount CHECK (refund_amount >= 0 AND refund_amount <= amount)
);

-- Index for faster lookups
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
```

## Waiting List

The `waiting_list` table stores information about users on waiting lists for full game slots.

```sql
CREATE TABLE waiting_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    child_id UUID NOT NULL REFERENCES children(id),
    game_slot_id UUID NOT NULL REFERENCES game_slots(id),
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'converted', 'expired')),
    notified_at TIMESTAMP WITH TIME ZONE,
    booking_id UUID REFERENCES bookings(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, child_id, game_slot_id)
);

-- Index for faster lookups
CREATE INDEX idx_waiting_list_user_id ON waiting_list(user_id);
CREATE INDEX idx_waiting_list_game_slot_id ON waiting_list(game_slot_id);
CREATE INDEX idx_waiting_list_status ON waiting_list(status);
```

## Event Gallery

The `event_gallery` table stores images for events.

```sql
CREATE TABLE event_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_event_gallery_event_id ON event_gallery(event_id);
CREATE INDEX idx_event_gallery_active ON event_gallery(is_active);
```

## Event FAQs

The `event_faqs` table stores frequently asked questions for events.

```sql
CREATE TABLE event_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_event_faqs_event_id ON event_faqs(event_id);
CREATE INDEX idx_event_faqs_active ON event_faqs(is_active);
```

## User Favorites

The `user_favorites` table stores events favorited by users.

```sql
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id)
);

-- Index for faster lookups
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_event_id ON user_favorites(event_id);
```

## Database Functions

### Age Calculation Function

This function calculates a child's age in months on a specific date.

```sql
CREATE OR REPLACE FUNCTION calculate_age_in_months(dob DATE, event_date DATE)
RETURNS INTEGER AS $$
DECLARE
    years INTEGER;
    months INTEGER;
BEGIN
    years := DATE_PART('year', event_date) - DATE_PART('year', dob);
    months := DATE_PART('month', event_date) - DATE_PART('month', dob);
    
    -- Adjust for day of month
    IF DATE_PART('day', event_date) < DATE_PART('day', dob) THEN
        months := months - 1;
    END IF;
    
    RETURN years * 12 + months;
END;
$$ LANGUAGE plpgsql;
```

### Booking Number Generator

This function generates a unique booking number.

```sql
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    new_booking_number VARCHAR(20);
    exists_already BOOLEAN;
BEGIN
    LOOP
        -- Generate a booking number with format NIBOG-YYYYMMDD-XXXX
        new_booking_number := 'NIBOG-' || 
                             TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' ||
                             LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Check if this booking number already exists
        SELECT EXISTS(SELECT 1 FROM bookings WHERE booking_number = new_booking_number) INTO exists_already;
        
        -- Exit loop if we have a unique booking number
        EXIT WHEN NOT exists_already;
    END LOOP;
    
    RETURN new_booking_number;
END;
$$ LANGUAGE plpgsql;
```

## Triggers

### Update Slot Booking Count

This trigger updates the booked_count in game_slots when a booking is created, updated, or deleted.

```sql
CREATE OR REPLACE FUNCTION update_slot_booking_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment booked_count for the slot
        UPDATE game_slots
        SET booked_count = booked_count + 1,
            status = CASE WHEN booked_count + 1 >= capacity THEN 'full' ELSE status END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.game_slot_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement booked_count for the slot
        UPDATE game_slots
        SET booked_count = GREATEST(0, booked_count - 1),
            status = CASE WHEN status = 'full' AND booked_count - 1 < capacity THEN 'active' ELSE status END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.game_slot_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.game_slot_id <> NEW.game_slot_id THEN
        -- Booking moved to a different slot
        -- Decrement old slot
        UPDATE game_slots
        SET booked_count = GREATEST(0, booked_count - 1),
            status = CASE WHEN status = 'full' AND booked_count - 1 < capacity THEN 'active' ELSE status END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.game_slot_id;
        
        -- Increment new slot
        UPDATE game_slots
        SET booked_count = booked_count + 1,
            status = CASE WHEN booked_count + 1 >= capacity THEN 'full' ELSE status END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.game_slot_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_slot_booking_count
AFTER INSERT OR UPDATE OR DELETE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_slot_booking_count();
```

### Set Booking Number

This trigger sets a unique booking number when a booking is created.

```sql
CREATE OR REPLACE FUNCTION set_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_number IS NULL THEN
        NEW.booking_number := generate_booking_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_booking_number
BEFORE INSERT ON bookings
FOR EACH ROW EXECUTE FUNCTION set_booking_number();
```

### Update Timestamp

This trigger updates the updated_at timestamp when a record is updated.

```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply this trigger to all tables with updated_at column
CREATE TRIGGER trg_update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Repeat for all other tables with updated_at column
```
