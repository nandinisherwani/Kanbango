/*
  # Initial Kanbango Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text)
      - `avatar_url` (text, optional)
      - `role` (text, default 'member')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `projects`
      - `id` (uuid, primary key)
      - `name` (text)
      - `key` (text, unique)
      - `description` (text, optional)
      - `owner_id` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `issues`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text, optional)
      - `type` (text, enum-like)
      - `status` (text, enum-like)
      - `priority` (text, enum-like)
      - `project_id` (uuid, references projects)
      - `assignee_id` (uuid, references profiles, optional)
      - `reporter_id` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `comments`
      - `id` (uuid, primary key)
      - `content` (text)
      - `issue_id` (uuid, references issues)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamp)

    - `activities`
      - `id` (uuid, primary key)
      - `type` (text)
      - `description` (text)
      - `issue_id` (uuid, references issues, optional)
      - `user_id` (uuid, references profiles)
      - `project_id` (uuid, references projects)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
    - Policies for project members to access project data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  key text NOT NULL UNIQUE,
  description text,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create issues table
CREATE TABLE IF NOT EXISTS issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'story' CHECK (type IN ('story', 'bug', 'task', 'epic')),
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'in_review', 'done')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('lowest', 'low', 'medium', 'high', 'highest')),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reporter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  issue_id uuid NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('issue_created', 'issue_updated', 'comment_added', 'status_changed')),
  description text NOT NULL,
  issue_id uuid REFERENCES issues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can read projects they own"
  ON projects
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Project owners can update their projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Project owners can delete their projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Issues policies
CREATE POLICY "Users can read issues in their projects"
  ON issues
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create issues in their projects"
  ON issues
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    ) AND reporter_id = auth.uid()
  );

CREATE POLICY "Users can update issues in their projects"
  ON issues
  FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete issues in their projects"
  ON issues
  FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Comments policies
CREATE POLICY "Users can read comments on issues in their projects"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    issue_id IN (
      SELECT i.id FROM issues i
      JOIN projects p ON i.project_id = p.id
      WHERE p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments on issues in their projects"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    issue_id IN (
      SELECT i.id FROM issues i
      JOIN projects p ON i.project_id = p.id
      WHERE p.owner_id = auth.uid()
    )
  );

-- Activities policies
CREATE POLICY "Users can read activities in their projects"
  ON activities
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create activities in their projects"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_issues_project_id ON issues(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_assignee_id ON issues(assignee_id);
CREATE INDEX IF NOT EXISTS idx_issues_reporter_id ON issues(reporter_id);
CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_project_id ON activities(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_issue_id ON activities(issue_id);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();