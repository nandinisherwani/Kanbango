import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project } from '../types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating project:', project);
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();

      if (error) throw error;
      console.log('Project created successfully:', data);
      setProjects([data, ...projects]);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating project:', error);
      return { data: null, error };
    }
  };

  return {
    projects,
    loading,
    createProject,
    refetch: fetchProjects,
  };
}