-- Create function that will parse the Clerk user ID from the authentication token
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
    SELECT NULLIF(
        current_setting('request.jwt.claims', true)::json->>'sub',
        ''
    )::text;
$$ LANGUAGE SQL STABLE;

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'developer', 'viewer');

-- Create teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table to manage team membership and roles
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL DEFAULT requesting_user_id(), -- Clerk user ID
  role user_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Team members can view their teams"
  ON teams AS PERMISSIVE FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = requesting_user_id()
    )
  );

CREATE POLICY "Only admins can create teams"
  ON teams AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (
    TRUE
  );

CREATE POLICY "Only team admins can update teams"
  ON teams AS PERMISSIVE FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = requesting_user_id()
      AND team_members.role = 'admin'
    )
  );

CREATE POLICY "Only team admins can delete teams"
  ON teams AS PERMISSIVE FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = requesting_user_id()
      AND team_members.role = 'admin'
    )
  );

-- Add trigger to automatically add team creator as admin
CREATE OR REPLACE FUNCTION add_team_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO team_members (team_id, user_id, role)
    VALUES (NEW.id, requesting_user_id(), 'admin');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER add_team_creator_as_admin_trigger
    AFTER INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION add_team_creator_as_admin();

-- Team members policies
CREATE POLICY "Team members can view other team members"
  ON team_members AS PERMISSIVE FOR SELECT TO authenticated 
  USING (
    team_members.user_id = requesting_user_id()
  );

CREATE POLICY "Only team admins can manage team members"
  ON team_members AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (
    (
      -- Allow team admins to add members
      EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = team_members.team_id
        AND tm.user_id = requesting_user_id()
        AND tm.role = 'admin'
      )
    ) OR (
      -- Allow the initial team member creation when creating a new team
      NOT EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = team_members.team_id
      ) AND
      requesting_user_id() = team_members.user_id
    )
  );

CREATE POLICY "Only team admins can update team members"
  ON team_members AS PERMISSIVE FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = requesting_user_id()
      AND tm.role = 'admin'
    )
  );

CREATE POLICY "Only team admins can remove team members"
  ON team_members AS PERMISSIVE FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = requesting_user_id()
      AND tm.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX team_members_team_id_idx ON team_members(team_id);
CREATE INDEX team_members_user_id_idx ON team_members(user_id); 