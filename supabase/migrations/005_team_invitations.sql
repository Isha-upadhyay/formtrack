-- Add role to profiles if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'profiles'::regclass AND attname = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'admin';
  END IF;
END $$;

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer',
  status TEXT DEFAULT 'pending', -- pending, accepted, expired
  token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- RLS for invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Admins can see/create invitations for their org
DROP POLICY IF EXISTS "Admins can manage invitations" ON invitations;
CREATE POLICY "Admins can manage invitations" ON invitations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.org_id = invitations.org_id
      AND profiles.role = 'admin'
    )
  );

-- Users can see invitations sent to their email
DROP POLICY IF EXISTS "Users can see their own invitations" ON invitations;
CREATE POLICY "Users can see their own invitations" ON invitations
  FOR SELECT
  TO authenticated
  USING (email = (auth.jwt() ->> 'email'));
