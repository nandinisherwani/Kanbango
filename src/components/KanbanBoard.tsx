import React from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Issue } from '../types';
import IssueCard from './IssueCard';

interface KanbanBoardProps {
  issues: Issue[];
  onCreateIssue: () => void;
  onIssueClick: (issue: Issue) => void;
  onStatusChange: (issueId: string, newStatus: Issue['status']) => void;
}

const statusColumns = [
  { id: 'todo' as const, title: 'To Do', color: 'bg-gray-100' },
  { id: 'in_progress' as const, title: 'In Progress', color: 'bg-blue-100' },
  { id: 'in_review' as const, title: 'In Review', color: 'bg-yellow-100' },
  { id: 'done' as const, title: 'Done', color: 'bg-green-100' },
];

export default function KanbanBoard({ 
  issues, 
  onCreateIssue, 
  onIssueClick, 
  onStatusChange 
}: KanbanBoardProps) {
  const getIssuesByStatus = (status: Issue['status']) => {
    return issues.filter(issue => issue.status === status);
  };

  const handleDragStart = (e: React.DragEvent, issueId: string) => {
    e.dataTransfer.setData('text/plain', issueId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: Issue['status']) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain');
    onStatusChange(issueId, status);
  };

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex space-x-6 h-full min-w-max p-6">
        {statusColumns.map((column) => {
          const columnIssues = getIssuesByStatus(column.id);
          
          return (
            <div
              key={column.id}
              className="w-80 flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className={`rounded-t-lg p-4 ${column.color}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{column.title}</h3>
                    <span className="bg-white bg-opacity-60 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                      {columnIssues.length}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {column.id === 'todo' && (
                      <button
                        onClick={onCreateIssue}
                        className="p-1 text-gray-600 hover:text-blue-600 hover:bg-white hover:bg-opacity-60 rounded transition-colors"
                        title="Create issue"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-1 text-gray-600 hover:text-gray-900 hover:bg-white hover:bg-opacity-60 rounded transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 bg-gray-50 p-4 space-y-3 min-h-96 rounded-b-lg border-2 border-dashed border-gray-200">
                {columnIssues.map((issue) => (
                  <div
                    key={issue.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, issue.id)}
                    onClick={() => onIssueClick(issue)}
                    className="cursor-pointer"
                  >
                    <IssueCard issue={issue} />
                  </div>
                ))}
                
                {columnIssues.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No issues</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}