
-- Restore the subscribers table to its previous state by removing the credits column
ALTER TABLE subscribers 
DROP COLUMN IF EXISTS credits;

-- Remove the onboarding_completed column from profiles table
ALTER TABLE profiles 
DROP COLUMN IF EXISTS onboarding_completed;

-- Drop the trigger we added
DROP TRIGGER IF EXISTS assign_credits_on_signup ON auth.users;

-- Drop the function we added
DROP FUNCTION IF EXISTS public.assign_initial_credits();

-- Update existing records in subscribers table that might have been affected
UPDATE subscribers
SET first_usage_time = created_at,
    last_usage_time = updated_at
WHERE first_usage_time IS NULL;
