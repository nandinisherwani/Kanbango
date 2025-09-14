import React from 'react';
import { 
  Folder, 
  BarChart3, 
  Settings, 
  Users, 
  Plus,
  ChevronRight,
  Bug,
  CheckCircle2
} from 'lucide-react';
import { Project } from '../types';

interface SidebarProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
  onCreateProject: () => void;
}

export default function Sidebar({ 
  projects, 
  selectedProject, 
  onProjectSelect, 
  onCreateProject 
}: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6 space-y-6">
        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Projects
            </h2>
            <button
              onClick={onCreateProject}
              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Create project"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onProjectSelect(project)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  selectedProject?.id === project.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-semibold">
                    {project.key}
                  </div>
                  <span className="font-medium">{project.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        {selectedProject && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Completed</span>
                </div>
                <span className="font-medium"></span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Bug className="w-4 h-4 text-red-600" />
                  <span className="text-gray-600">Bugs</span>
                </div>
                <span className="font-medium"></span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">In Progress</span>
                </div>
                <span className="font-medium"></span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="border-t border-gray-200 pt-6">
          <nav className="space-y-1">
            <a href="#" className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              <BarChart3 className="w-5 h-5" />
              <span>Reports</span>
            </a>
            <a href="#" className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              <Users className="w-5 h-5" />
              <span>Team</span>
            </a>
            <a href="#" className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </a>
          </nav>
        </div>
      </div>
    </aside>
  );
}