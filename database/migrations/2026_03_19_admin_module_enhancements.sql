-- Admin Module Enhancements

-- 1. Audit Logs for high-level accountability
CREATE TABLE IF NOT EXISTS public.audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id INTEGER REFERENCES public.staff(staff_id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Granular Permissions
CREATE TABLE IF NOT EXISTS public.staff_permissions (
    permission_id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES public.staff(staff_id) ON DELETE CASCADE,
    module VARCHAR(50) NOT NULL, -- e.g., 'financials', 'inventory', 'patients', 'hr'
    can_read BOOLEAN DEFAULT TRUE,
    can_write BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    UNIQUE(staff_id, module)
);

-- 3. System Settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value JSONB,
    description TEXT,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES public.staff(staff_id)
);

-- 4. Staff Attendance
CREATE TABLE IF NOT EXISTS public.staff_attendance (
    attendance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id INTEGER REFERENCES public.staff(staff_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP WITHOUT TIME ZONE,
    status VARCHAR(20) DEFAULT 'Present', -- 'Present', 'Absent', 'Half-Day', 'Leave'
    marked_by VARCHAR(50), -- 'Scanner', 'Admin', 'Auto'
    admin_id INTEGER REFERENCES public.staff(staff_id), -- If manually adjusted
    UNIQUE(staff_id, date)
);

-- Initial Settings
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES 
('hospital_name', '"HMS Premium Healthcare"', 'The display name of the institution'),
('tax_rate', '17.0', 'Standard GST rate applied to bills'),
('currency', '"PKR"', 'System default currency'),
('low_stock_global_threshold', '10', 'Default threshold for inventory alerts')
ON CONFLICT (setting_key) DO NOTHING;
