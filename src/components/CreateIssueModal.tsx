import React, { useState } from 'react';
import { X, Bug, CheckSquare, FileText, Layers } from 'lucide-react';
import { Issue, Project } from '../types';
import { useAuth } from '../hooks/useAuth';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (issue: Omit<Issue, 'id' | 'created_at' | 'updated_at' | 'assignee' | 'reporter'>) => void;
  project: Project;
}

const issueTypes = [
  { value: 'story', label: 'Story', icon: FileText, color: 'text-green-600' },
  { value: 'bug', label: 'Bug', icon: Bug, color: 'text-red-600' },
  { value: 'task', label: 'Task', icon: CheckSquare, color: 'text-blue-600' },
  { value: 'epic', label: 'Epic', icon: Layers, color: 'text-purple-600' },
];

const priorities = [
  { value: 'lowest', label: 'Lowest' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'highest', label: 'Highest' },
];

export default function CreateIssueModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  project 
}: CreateIssueModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'story' as Issue['type'],
    priority: 'medium' as Issue['priority'],
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    console.log('Creating issue with user ID:', user.id);
    console.log('Form data:', formData);
    console.log('Project ID:', project.id);

    const issue = {
      ...formData,
      status: 'todo' as Issue['status'],
      project_id: project.id,
      reporter_id: user.id,
      assignee_id: undefined,
    };

    onSubmit(issue);
    setFormData({
      title: '',
      description: '',
      type: 'story',
      priority: 'medium',
    });
    onClose();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Issue</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-semibold">
                {project.key}
              </div>
              <span className="font-medium text-blue-900">{project.name}</span>
            </div>
          </div>

          {/* Issue Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Type
            </label>
            <div className="grid grid-cols-4 gap-3">
              {issueTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value as Issue['type'] }))}
                    className={`p-3 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 ${type.color}`} />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter issue title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the issue in detail"
            />
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              Create Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}