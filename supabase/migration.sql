
-- Add chart_settings column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS chart_settings JSONB DEFAULT NULL;

-- Add first_usage_time and last_usage_time columns to subscribers table
ALTER TABLE subscribers 
ADD COLUMN IF NOT EXISTS first_usage_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_usage_time TIMESTAMPTZ;

-- Update existing records to set first_usage_time and last_usage_time
UPDATE subscribers
SET first_usage_time = created_at,
    last_usage_time = updated_at
WHERE first_usage_time IS NULL;
