import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useProjects } from './hooks/useProjects';
import { useIssues } from './hooks/useIssues';
import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import CreateIssueModal from './components/CreateIssueModal';
import CreateProjectModal from './components/CreateProjectModal';
import { Project, Issue } from './types';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, createProject } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { issues, loading: issuesLoading, createIssue, updateIssue } = useIssues(selectedProject?.id || '');
  
  const [isCreateIssueModalOpen, setIsCreateIssueModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Set default project when projects load
  React.useEffect(() => {
    if (!projectsLoading && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject, projectsLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('App: Creating project with data:', projectData);
    const { data } = await createProject(projectData);
    if (data) {
      console.log('App: Project created, setting as selected:', data);
      setSelectedProject(data);
    } else {
      console.error('App: Failed to create project');
    }
  };

  const handleCreateIssue = async (issueData: Omit<Issue, 'id' | 'created_at' | 'updated_at' | 'assignee' | 'reporter'>) => {
    await createIssue(issueData);
  };

  const handleStatusChange = async (issueId: string, newStatus: Issue['status']) => {
    await updateIssue(issueId, { status: newStatus });
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    // TODO: Open issue detail modal
  };

  return (
    <Layout>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          projects={projects}
          selectedProject={selectedProject}
          onProjectSelect={setSelectedProject}
          onCreateProject={() => setIsCreateProjectModalOpen(true)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedProject ? (
            <>
              {/* Project Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {selectedProject.key}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h1>
                        <p className="text-gray-600">Kanban Board</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {issues.length} issues
                    </span>
                  </div>
                </div>
              </div>

              {/* Kanban Board */}
              {issuesLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading issues...</p>
                  </div>
                </div>
              ) : (
                <KanbanBoard
                  issues={issues}
                  onCreateIssue={() => setIsCreateIssueModalOpen(true)}
                  onIssueClick={handleIssueClick}
                  onStatusChange={handleStatusChange}
                />
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              {projectsLoading ? (
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading projects...</p>
                </div>
              ) : (
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to Kanbango</h2>
                  <p className="text-gray-600 mb-6">Create your first project to get started</p>
                  <button
                    onClick={() => setIsCreateProjectModalOpen(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onSubmit={handleCreateProject}
      />

      {selectedProject && (
        <CreateIssueModal
          isOpen={isCreateIssueModalOpen}
          onClose={() => setIsCreateIssueModalOpen(false)}
          onSubmit={handleCreateIssue}
          project={selectedProject}
        />
      )}
    </Layout>
  );
}

export default App;