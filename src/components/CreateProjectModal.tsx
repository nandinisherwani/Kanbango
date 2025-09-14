import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Project } from '../types';
import { useAuth } from '../hooks/useAuth';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
}

export default function CreateProjectModal({ 
  isOpen, 
  onClose, 
  onSubmit 
}: CreateProjectModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    console.log('Submitting project with user:', user.id);
    const project = {
      ...formData,
      owner_id: user.id,
    };

    console.log('Project data to submit:', project);
    onSubmit(project);
    setFormData({ name: '', key: '', description: '' });
    onClose();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate key from name
    if (name === 'name') {
      const key = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 4);
      setFormData(prev => ({ ...prev, key }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-2">
              Project Key *
            </label>
            <input
              type="text"
              id="key"
              name="key"
              required
              value={formData.key}
              onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="PROJ"
              maxLength={10}
            />
            <p className="text-xs text-gray-500 mt-1">
              A unique identifier for this project (2-10 characters)
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your project"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
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
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}