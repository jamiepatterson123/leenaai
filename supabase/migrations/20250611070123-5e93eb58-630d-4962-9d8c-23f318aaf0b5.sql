
-- Add consultation-related fields to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN consultation_completed boolean DEFAULT false,
ADD COLUMN consultation_insights jsonb DEFAULT null,
ADD COLUMN consultation_completed_at timestamp with time zone DEFAULT null;

-- Update the updated_at trigger to handle the new columns
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at_trigger') THEN
        CREATE TRIGGER update_profiles_updated_at_trigger
            BEFORE UPDATE ON public.profiles
            FOR EACH ROW
            EXECUTE FUNCTION update_profiles_updated_at();
    END IF;
END
$$;
