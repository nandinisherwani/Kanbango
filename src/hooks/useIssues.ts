import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Issue } from '../types';

export function useIssues(projectId: string) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchIssues();
    }
  }, [projectId]);

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          assignee:profiles!assignee_id(id, full_name, email, avatar_url),
          reporter:profiles!reporter_id(id, full_name, email, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const createIssue = async (issue: Omit<Issue, 'id' | 'created_at' | 'updated_at' | 'assignee' | 'reporter'>) => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .insert([issue])
        .select(`
          *,
          assignee:profiles!assignee_id(id, full_name, email, avatar_url),
          reporter:profiles!reporter_id(id, full_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;
      setIssues([data, ...issues]);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating issue:', error);
      return { data: null, error };
    }
  };

  const updateIssue = async (id: string, updates: Partial<Issue>) => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          assignee:profiles!assignee_id(id, full_name, email, avatar_url),
          reporter:profiles!reporter_id(id, full_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;
      
      setIssues(issues.map(issue => 
        issue.id === id ? data : issue
      ));
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating issue:', error);
      return { data: null, error };
    }
  };

  return {
    issues,
    loading,
    createIssue,
    updateIssue,
    refetch: fetchIssues,
  };
}