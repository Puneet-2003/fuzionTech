import { FC, FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';

const DashboardPage: FC = () => {
  const [projectName, setProjectName] = useState<string>('');
  const [projectDesc, setProjectDesc] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const navigate = useNavigate();

  const { projects, loading, fetchProjects, createProject } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createProject({ name: projectName, description: projectDesc });
      setProjectName('');
      setProjectDesc('');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create project');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">My Projects</h1>
          <div className="space-x-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#1868db] text-white px-4 py-2 rounded-lg hover:bg-[#1868db]"
            >
              + New Project
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/login');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder="Project description (optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No projects yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="bg-white rounded-lg border border-[#1868db] p-6 shadow hover:shadow-lg cursor-pointer transition"
              >
                <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                <p className="text-gray-600 text-sm mt-2">{project.description}</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-[#1868db]">
                    {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
