-- Add webhook_url and slug to orgs if they don't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'orgs'::regclass AND attname = 'webhook_url') THEN
    ALTER TABLE orgs ADD COLUMN webhook_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'orgs'::regclass AND attname = 'slug') THEN
    ALTER TABLE orgs ADD COLUMN slug TEXT UNIQUE;
  END IF;
END $$;
