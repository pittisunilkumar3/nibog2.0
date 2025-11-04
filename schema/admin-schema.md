# Admin Schema - NIBOG Platform

This file contains the database schema for admin-specific entities for the NIBOG Platform, including analytics, reporting, and management features.

## Add-ons

The `addons` table stores information about add-ons that can be purchased with bookings.

```sql
CREATE TABLE addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    has_variants BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Index for faster lookups
CREATE INDEX idx_addons_is_active ON addons(is_active);
CREATE INDEX idx_addons_has_variants ON addons(has_variants);
```

## Add-on Variants

The `addon_variants` table stores variants of add-ons.

```sql
CREATE TABLE addon_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    addon_id UUID NOT NULL REFERENCES addons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_addon_variants_addon_id ON addon_variants(addon_id);
CREATE INDEX idx_addon_variants_is_active ON addon_variants(is_active);
```

## Event Add-ons

The `event_addons` table associates add-ons with events.

```sql
CREATE TABLE event_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    addon_id UUID NOT NULL REFERENCES addons(id) ON DELETE CASCADE,
    custom_price DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, addon_id)
);

-- Index for faster lookups
CREATE INDEX idx_event_addons_event_id ON event_addons(event_id);
CREATE INDEX idx_event_addons_addon_id ON event_addons(addon_id);
CREATE INDEX idx_event_addons_is_active ON event_addons(is_active);
```

## Promo Codes

The `promo_codes` table stores promotional codes for discounts.

```sql
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    CONSTRAINT check_discount_value CHECK (discount_value > 0),
    CONSTRAINT check_date_range CHECK (start_date <= end_date)
);

-- Index for faster lookups
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_is_active ON promo_codes(is_active);
CREATE INDEX idx_promo_codes_date_range ON promo_codes(start_date, end_date);
```

## Promo Code Restrictions

The `promo_code_restrictions` table stores restrictions for promo codes.

```sql
CREATE TABLE promo_code_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
    restriction_type VARCHAR(20) NOT NULL CHECK (restriction_type IN ('city', 'event', 'game', 'user')),
    restriction_value UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_promo_code_restrictions_promo_code_id ON promo_code_restrictions(promo_code_id);
CREATE INDEX idx_promo_code_restrictions_type_value ON promo_code_restrictions(restriction_type, restriction_value);
```

## Promo Code Usage

The `promo_code_usage` table tracks usage of promo codes.

```sql
CREATE TABLE promo_code_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    discount_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(promo_code_id, booking_id)
);

-- Index for faster lookups
CREATE INDEX idx_promo_code_usage_promo_code_id ON promo_code_usage(promo_code_id);
CREATE INDEX idx_promo_code_usage_booking_id ON promo_code_usage(booking_id);
CREATE INDEX idx_promo_code_usage_user_id ON promo_code_usage(user_id);
```

## Staff

The `staff` table stores information about staff members.

```sql
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    hire_date DATE NOT NULL,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_staff_user_id ON staff(user_id);
CREATE INDEX idx_staff_department ON staff(department);
CREATE INDEX idx_staff_is_active ON staff(is_active);
```

## Event Staff

The `event_staff` table associates staff members with events.

```sql
CREATE TABLE event_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, staff_id)
);

-- Index for faster lookups
CREATE INDEX idx_event_staff_event_id ON event_staff(event_id);
CREATE INDEX idx_event_staff_staff_id ON event_staff(staff_id);
```

## Inventory

The `inventory` table stores inventory items.

```sql
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 0,
    unit_cost DECIMAL(10, 2),
    total_value DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    reorder_level INTEGER,
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Index for faster lookups
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_is_active ON inventory(is_active);
```

## Inventory Transactions

The `inventory_transactions` table tracks inventory movements.

```sql
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'use', 'adjustment', 'return')),
    quantity INTEGER NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Index for faster lookups
CREATE INDEX idx_inventory_transactions_inventory_id ON inventory_transactions(inventory_id);
CREATE INDEX idx_inventory_transactions_transaction_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inventory_transactions_reference ON inventory_transactions(reference_type, reference_id);
CREATE INDEX idx_inventory_transactions_created_at ON inventory_transactions(created_at);
```

## Event Inventory

The `event_inventory` table tracks inventory allocated to events.

```sql
CREATE TABLE event_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    quantity_allocated INTEGER NOT NULL,
    quantity_returned INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    UNIQUE(event_id, inventory_id)
);

-- Index for faster lookups
CREATE INDEX idx_event_inventory_event_id ON event_inventory(event_id);
CREATE INDEX idx_event_inventory_inventory_id ON event_inventory(inventory_id);
```

## Expenses

The `expenses` table tracks expenses.

```sql
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    payment_method VARCHAR(50),
    receipt_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Index for faster lookups
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_reference ON expenses(reference_type, reference_id);
```

## Event Expenses

The `event_expenses` table tracks expenses specific to events.

```sql
CREATE TABLE event_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, expense_id)
);

-- Index for faster lookups
CREATE INDEX idx_event_expenses_event_id ON event_expenses(event_id);
CREATE INDEX idx_event_expenses_expense_id ON event_expenses(expense_id);
```

## Revenue

The `revenue` table tracks revenue.

```sql
CREATE TABLE revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    revenue_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Index for faster lookups
CREATE INDEX idx_revenue_revenue_date ON revenue(revenue_date);
CREATE INDEX idx_revenue_category ON revenue(category);
CREATE INDEX idx_revenue_reference ON revenue(reference_type, reference_id);
```

## Event Revenue

The `event_revenue` table tracks revenue specific to events.

```sql
CREATE TABLE event_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    revenue_id UUID NOT NULL REFERENCES revenue(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, revenue_id)
);

-- Index for faster lookups
CREATE INDEX idx_event_revenue_event_id ON event_revenue(event_id);
CREATE INDEX idx_event_revenue_revenue_id ON event_revenue(revenue_id);
```

## Audit Logs

The `audit_logs` table tracks changes to important data.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

## System Settings

The `system_settings` table stores system-wide settings.

```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(20) NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

-- Index for faster lookups
CREATE INDEX idx_system_settings_setting_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_is_public ON system_settings(is_public);
```

## Reports

The `reports` table stores saved report configurations.

```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL,
    parameters JSONB,
    created_by UUID REFERENCES users(id),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_reports_report_type ON reports(report_type);
CREATE INDEX idx_reports_created_by ON reports(created_by);
CREATE INDEX idx_reports_is_public ON reports(is_public);
```

## Report Schedules

The `report_schedules` table stores schedules for automated reports.

```sql
CREATE TABLE report_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
    time_of_day TIME NOT NULL,
    recipients JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Index for faster lookups
CREATE INDEX idx_report_schedules_report_id ON report_schedules(report_id);
CREATE INDEX idx_report_schedules_is_active ON report_schedules(is_active);
CREATE INDEX idx_report_schedules_next_run_at ON report_schedules(next_run_at);
```

## Analytics

The `analytics` table stores aggregated analytics data.

```sql
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    metric VARCHAR(100) NOT NULL,
    dimension VARCHAR(100),
    dimension_value VARCHAR(255),
    value DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_analytics_date ON analytics(date);
CREATE INDEX idx_analytics_metric ON analytics(metric);
CREATE INDEX idx_analytics_dimension ON analytics(dimension, dimension_value);
```

## User Activity Logs

The `user_activity_logs` table tracks user activity.

```sql
CREATE TABLE user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES user_sessions(id),
    activity_type VARCHAR(50) NOT NULL,
    page_url VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_session_id ON user_activity_logs(session_id);
CREATE INDEX idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at);
```

## Functions and Triggers

### Audit Log Trigger

This function creates an audit log entry when important data is changed.

```sql
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    old_values JSONB := NULL;
    new_values JSONB := NULL;
    action_type VARCHAR(50);
BEGIN
    IF TG_OP = 'INSERT' THEN
        action_type := 'create';
        new_values := row_to_json(NEW)::JSONB;
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'update';
        old_values := row_to_json(OLD)::JSONB;
        new_values := row_to_json(NEW)::JSONB;
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'delete';
        old_values := row_to_json(OLD)::JSONB;
    END IF;
    
    INSERT INTO audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        ip_address,
        created_at
    ) VALUES (
        current_setting('app.current_user_id', TRUE)::UUID,
        action_type,
        TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        old_values,
        new_values,
        current_setting('app.current_ip_address', TRUE),
        CURRENT_TIMESTAMP
    );
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply this trigger to important tables
CREATE TRIGGER trg_users_audit_log
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Repeat for other important tables
```

### Update Promo Code Usage Count

This trigger updates the usage count for promo codes.

```sql
CREATE OR REPLACE FUNCTION update_promo_code_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE promo_codes
        SET usage_count = usage_count + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.promo_code_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE promo_codes
        SET usage_count = GREATEST(0, usage_count - 1),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.promo_code_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_promo_code_usage_count
AFTER INSERT OR DELETE ON promo_code_usage
FOR EACH ROW EXECUTE FUNCTION update_promo_code_usage_count();
```

### Calculate Event Revenue

This function calculates total revenue for an event.

```sql
CREATE OR REPLACE FUNCTION calculate_event_revenue(event_id UUID)
RETURNS DECIMAL(15, 2) AS $$
DECLARE
    total_revenue DECIMAL(15, 2);
BEGIN
    -- Calculate revenue from bookings
    SELECT COALESCE(SUM(b.total_amount), 0)
    INTO total_revenue
    FROM bookings b
    JOIN game_slots gs ON b.game_slot_id = gs.id
    JOIN event_games eg ON gs.event_game_id = eg.id
    WHERE eg.event_id = calculate_event_revenue.event_id
    AND b.payment_status = 'paid';
    
    RETURN total_revenue;
END;
$$ LANGUAGE plpgsql;
```

### Calculate Event Expenses

This function calculates total expenses for an event.

```sql
CREATE OR REPLACE FUNCTION calculate_event_expenses(event_id UUID)
RETURNS DECIMAL(15, 2) AS $$
DECLARE
    total_expenses DECIMAL(15, 2);
BEGIN
    -- Calculate expenses from event_expenses
    SELECT COALESCE(SUM(e.amount), 0)
    INTO total_expenses
    FROM event_expenses ee
    JOIN expenses e ON ee.expense_id = e.id
    WHERE ee.event_id = calculate_event_expenses.event_id;
    
    RETURN total_expenses;
END;
$$ LANGUAGE plpgsql;
```

### Calculate Event Profit

This function calculates profit for an event.

```sql
CREATE OR REPLACE FUNCTION calculate_event_profit(event_id UUID)
RETURNS DECIMAL(15, 2) AS $$
DECLARE
    revenue DECIMAL(15, 2);
    expenses DECIMAL(15, 2);
BEGIN
    revenue := calculate_event_revenue(event_id);
    expenses := calculate_event_expenses(event_id);
    
    RETURN revenue - expenses;
END;
$$ LANGUAGE plpgsql;
```

### Generate Analytics Data

This function generates analytics data for a specific date.

```sql
CREATE OR REPLACE FUNCTION generate_daily_analytics(analysis_date DATE)
RETURNS VOID AS $$
BEGIN
    -- Delete existing analytics for the date
    DELETE FROM analytics WHERE date = analysis_date;
    
    -- Total bookings
    INSERT INTO analytics (date, metric, value)
    SELECT analysis_date, 'total_bookings', COUNT(*)
    FROM bookings
    WHERE DATE(created_at) = analysis_date;
    
    -- Total revenue
    INSERT INTO analytics (date, metric, value)
    SELECT analysis_date, 'total_revenue', COALESCE(SUM(total_amount), 0)
    FROM bookings
    WHERE DATE(created_at) = analysis_date
    AND payment_status = 'paid';
    
    -- Bookings by city
    INSERT INTO analytics (date, metric, dimension, dimension_value, value)
    SELECT 
        analysis_date, 
        'bookings_by_city', 
        'city', 
        c.name, 
        COUNT(b.id)
    FROM bookings b
    JOIN game_slots gs ON b.game_slot_id = gs.id
    JOIN event_games eg ON gs.event_game_id = eg.id
    JOIN events e ON eg.event_id = e.id
    JOIN venues v ON e.venue_id = v.id
    JOIN cities c ON v.city_id = c.id
    WHERE DATE(b.created_at) = analysis_date
    GROUP BY c.name;
    
    -- Revenue by city
    INSERT INTO analytics (date, metric, dimension, dimension_value, value)
    SELECT 
        analysis_date, 
        'revenue_by_city', 
        'city', 
        c.name, 
        COALESCE(SUM(b.total_amount), 0)
    FROM bookings b
    JOIN game_slots gs ON b.game_slot_id = gs.id
    JOIN event_games eg ON gs.event_game_id = eg.id
    JOIN events e ON eg.event_id = e.id
    JOIN venues v ON e.venue_id = v.id
    JOIN cities c ON v.city_id = c.id
    WHERE DATE(b.created_at) = analysis_date
    AND b.payment_status = 'paid'
    GROUP BY c.name;
    
    -- New users
    INSERT INTO analytics (date, metric, value)
    SELECT analysis_date, 'new_users', COUNT(*)
    FROM users
    WHERE DATE(created_at) = analysis_date;
    
    -- Add more analytics as needed
END;
$$ LANGUAGE plpgsql;
```
