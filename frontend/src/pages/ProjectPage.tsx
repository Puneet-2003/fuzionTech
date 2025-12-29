import { FC, FormEvent, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { projectsAPI, tasksAPI } from '../services/api';
import { Project, Task } from '../types';

type TaskStatus = 'BACKLOG' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

const ProjectPage: FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  

  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskDesc, setTaskDesc] = useState<string>('');
  const [taskPriority, setTaskPriority] = useState<string>('MEDIUM');
  const [taskAssignee, setTaskAssignee] = useState<string>('');
  
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [showInviteForm, setShowInviteForm] = useState<boolean>(false);
  

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditingTask, setIsEditingTask] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { currentProject, setCurrentProject, inviteMember } = useProjectStore();
  const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();

  useEffect(() => {
    if (!projectId) return;
    const loadProject = async () => {
      try {
        const response = await projectsAPI.getById(projectId);
        setCurrentProject(response.data);
        await fetchTasks(projectId);
      } catch (error: any) {
        console.error('Failed to load project:', error.response?.data);
        setError('Failed to load project');
      }
    };
    loadProject();
  }, [projectId, setCurrentProject, fetchTasks]);

  const handleCreateTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectId) return;
    setError('');
    setIsLoading(true);
    try {
      const taskData: any = {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        assignee: taskAssignee || null  
      };
      
      await createTask(projectId, taskData);
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('MEDIUM');
      setTaskAssignee('');
      setShowTaskForm(false);
      setSuccess('Task created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Failed to create task:', error.response?.data);
      setError(error.response?.data?.error || 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

   const handleUpdateTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTask || !projectId) return;
    setError('');
    setIsLoading(true);
    try {
      const updateData: any = {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        assignee: taskAssignee || null   
      };
      
      await updateTask(selectedTask._id, updateData);
      setSelectedTask(null);
      setIsEditingTask(false);
      setSuccess('Task updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Failed to update task:', error);
      setError('Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };



  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setError('');
    setIsLoading(true);
    try {
      await deleteTask(taskToDelete);
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
      setSelectedTask(null);
      setSuccess('Task deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!projectId) return;
    setError('');
    setIsLoading(true);
    try {
      await inviteMember(projectId, inviteEmail);
      setInviteEmail('');
      setShowInviteForm(false);
      setSuccess('Member invited successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Failed to invite member:', error.response?.data);
      setError(error.response?.data?.error || 'Failed to invite member');
    } finally {
      setIsLoading(false);
    }
  };

  const openTaskEditor = (task: Task) => {
    setSelectedTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskPriority(task.priority);
    setTaskAssignee(task.assignee?._id || '');
    setIsEditingTask(true);
  };

  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsEditingTask(false);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, newStatus: TaskStatus) => {
    e.preventDefault();
    if (!draggedTaskId || !projectId) return;

    try {
      const task = tasks.find(t => t._id === draggedTaskId);
      if (!task) return;

      await updateTask(draggedTaskId, { status: newStatus });
      setDraggedTaskId(null);
      setSuccess('Task moved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Failed to update task:', error);
      setError('Failed to move task');
    }
  };

  if (!currentProject) {
    return (
      <div className="p-8">
        <p className="text-center text-gray-600">Loading...</p>
      </div>
    );
  }

  const statuses: TaskStatus[] = ['BACKLOG', 'IN_PROGRESS', 'REVIEW', 'DONE'];
  const tasksByStatus = statuses.reduce((acc, status) => {
    acc[status] = tasks.filter(t => t.status === status);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{currentProject.name}</h1>
              <p className="text-gray-600 mt-1">{currentProject.description}</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800 font-semibold transition"
            >
              ← Back to Dashboard
            </button>
          </div>

   
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">✕</button>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">✕</button>
            </div>
          )}

          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={() => {
                setShowTaskForm(!showTaskForm);
                setTaskTitle('');
                setTaskDesc('');
                setTaskPriority('MEDIUM');
                setTaskAssignee('');
              }}
              className="bg-[#1868db] text-white px-4 py-2 rounded-lg hover:bg-[#1868db] transition font-medium"
            >
              + Add Task
            </button>
            <button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="bg-[#1868db] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium"
            >
              + Invite Member
            </button>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Team Members ({currentProject.members.length}):</p>
            <div className="flex gap-2 flex-wrap">
              {currentProject.members.map((member) => (
                <span
                  key={member._id || member.id}
                  className="bg-[#1868db] text-white text-xs px-3 py-1 rounded-full font-medium"
                >
                  {member.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

   
      {showTaskForm && (
        <div className="bg-white border-b p-6 max-w-7xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Task</h3>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Enter task title"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2  "
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Enter task description"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2  "
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2  "
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2  "
                >
                  <option value="">Unassigned</option>
                  {currentProject.members.map((member) => (
                    <option key={member._id || member.id} value={member._id || member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className=" bg-[#1868db] text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition disabled:opacity-50 font-medium"
              >
                {isLoading ? 'Creating...' : 'Create Task'}
              </button>
              <button
                type="button"
                onClick={() => setShowTaskForm(false)}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}


      {showInviteForm && (
        <div className="bg-white border-b p-6 max-w-7xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Invite Team Member</h3>
          <form onSubmit={handleInviteMember} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member Email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter member email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 font-medium"
              >
                {isLoading ? 'Inviting...' : 'Invite'}
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}


      <div className="max-w-7xl mx-auto px-4 py-6">
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">No tasks yet. Create one to get started!</p>
            <button
              onClick={() => setShowTaskForm(true)}
              className=" bg-[#1868db] text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition font-medium"
            >
              + Create Your First Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statuses.map((status) => (
              <div
                key={status}
                className="bg-white rounded-lg p-4 shadow h-full"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-800 text-sm uppercase">{status}</h2>
                  <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {tasksByStatus[status].length}
                  </span>
                </div>
                <div className="space-y-2 min-h-96 bg-gray-50 rounded p-2">
                  {tasksByStatus[status].map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      className={` border border-blue-500 rounded p-3 cursor-move hover:shadow transition transform hover:scale-105 group ${
                        draggedTaskId === task._id ? 'opacity-50 scale-95' : ''
                      }`}
                      onClick={() => openTaskDetails(task)}
                    >
                      <p className="font-medium text-gray-800 text-sm truncate">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                      )}
                      <div className="mt-2 flex flex-col gap-2">
                        <div className="flex justify-between items-center gap-1">
                          <span
                            className={`text-[8px] px-2 py-1 rounded font-semibold ${
                             task.priority === 'HIGH'
                                ? 'bg-red-100 text-red-800'
                                : task.priority === 'MEDIUM'
                                ? 'bg-yellow-50 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        {task.assignee && (
                          <div className="bg-indigo-50 text-[#1868db] text-xs px-2 py-1 rounded font-medium">
                            Assigned To {task.assignee.name}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openTaskEditor(task);
                          }}
                          className="flex-1 bg-blue-500 text-white text-xs py-1 rounded hover:bg-blue-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTaskToDelete(task._id);
                            setShowDeleteConfirm(true);
                          }}
                          className="flex-1 bg-red-500 text-white text-xs py-1 rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {selectedTask && !isEditingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{selectedTask.title}</h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ✕
              </button>
            </div>
            
            {selectedTask.description && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Description</h3>
                <p className="text-gray-600 text-sm">{selectedTask.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Priority</h3>
                <span
                  className={`text-sm px-3 py-1 rounded font-semibold inline-block ${
                    selectedTask.priority === 'HIGH'
                      ? 'bg-red-100 text-red-800'
                      : selectedTask.priority === 'MEDIUM'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {selectedTask.priority}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Status</h3>
                <span className="text-sm px-3 py-1 rounded font-semibold inline-block bg-blue-100 text-blue-800">
                  {selectedTask.status}
                </span>
              </div>
            </div>

            {selectedTask.assignee ? (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Assigned to</h3>
                <p className="text-sm bg-indigo-100 text-indigo-700 px-3 py-2 rounded font-medium">
                  👤 {selectedTask.assignee.name}
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Assigned to</h3>
                <p className="text-sm text-gray-500">Unassigned</p>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={() => openTaskEditor(selectedTask)}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setTaskToDelete(selectedTask._id);
                  setShowDeleteConfirm(true);
                }}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedTask(null)}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {isEditingTask && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Edit Task</h2>
              <button
                onClick={() => {
                  setIsEditingTask(false);
                  setSelectedTask(null);
                }}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {currentProject.members.map((member) => (
                      <option key={member._id || member.id} value={member._id || member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 font-medium"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingTask(false);
                    setSelectedTask(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Delete Task?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteTask}
                disabled={isLoading}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50 font-medium"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setTaskToDelete(null);
                }}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;