import React from 'react';
import { Bug, CheckSquare, FileText, Layers } from 'lucide-react';
import { Issue } from '../types';

interface IssueCardProps {
  issue: Issue;
}

const issueTypeIcons = {
  story: FileText,
  bug: Bug,
  task: CheckSquare,
  epic: Layers,
};

const priorityColors = {
  lowest: 'bg-gray-100 text-gray-600',
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  highest: 'bg-red-100 text-red-700',
};

const typeColors = {
  story: 'text-green-600',
  bug: 'text-red-600',
  task: 'text-blue-600',
  epic: 'text-purple-600',
};

export default function IssueCard({ issue }: IssueCardProps) {
  const IconComponent = issueTypeIcons[issue.type];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Issue Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <IconComponent className={`w-4 h-4 ${typeColors[issue.type]}`} />
            <span className="text-xs font-medium text-gray-500 uppercase">
              {issue.type}
            </span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[issue.priority]}`}>
            {issue.priority}
          </span>
        </div>

        {/* Issue Title */}
        <h4 className="font-medium text-gray-900 line-clamp-2 leading-snug">
          {issue.title}
        </h4>

        {/* Issue Description */}
        {issue.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {issue.description}
          </p>
        )}

        {/* Issue Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            #{issue.id.slice(-6)}
          </div>
          
          {/* Assignee Avatar */}
          {issue.assignee ? (
            <div className="flex items-center space-x-2">
              <div 
                className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                title={issue.assignee.full_name || issue.assignee.email}
              >
                {(issue.assignee.full_name || issue.assignee.email)?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          ) : (
            <div className="w-6 h-6 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-400">?</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}