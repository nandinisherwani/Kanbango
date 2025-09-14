export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  title: string;
  description?: string;
  type: 'story' | 'bug' | 'task' | 'epic';
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  project_id: string;
  assignee_id?: string;
  reporter_id: string;
  created_at: string;
  updated_at: string;
  assignee?: User;
  reporter?: User;
}

export interface Comment {
  id: string;
  content: string;
  issue_id: string;
  user_id: string;
  created_at: string;
  user?: User;
}

export interface Activity {
  id: string;
  type: 'issue_created' | 'issue_updated' | 'comment_added' | 'status_changed';
  description: string;
  issue_id?: string;
  user_id: string;
  project_id: string;
  created_at: string;
  user?: User;
  issue?: Issue;
}