import React, { useState, useEffect } from 'react';
import api from '../api'; // Assuming you have an API utility for making HTTP requests

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]); // Store tasks
  const [task, setTask] = useState({
    title: '',
    description: '',
    assigned_user: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    status: 'Pending',
    priority: 'Medium',
    project_id: '',
    created_by: '',
  }); // Task state (used for both create and edit)
  const [users, setUsers] = useState([]); // List of users for assignment
  const [projects, setProjects] = useState([]); // List of projects
  const [loading, setLoading] = useState(true); // Loading state for API requests
  const [error, setError] = useState(''); // Error message state
  const [editMode, setEditMode] = useState(false); // Whether we are editing a task
  const [currentTaskId, setCurrentTaskId] = useState(null); // Task ID for editing

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      const formattedTasks = response.data.map((task) => ({
        ...task,
        start_date: task.start_date
          ? new Date(task.start_date).toISOString().slice(0, 16) // Format for datetime-local
          : '',
        end_date: task.end_date
          ? new Date(task.end_date).toISOString().slice(0, 16) // Format for datetime-local
          : '',
      }));
      setTasks(formattedTasks);
    } catch (err) {
      setError('Error fetching tasks');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await api.get('/tas/users');
      setUsers(response.data);
    } catch (err) {
      setError('Error fetching users');
    }
  };

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      const response = await api.get('/tas/projects');
      setProjects(response.data);
    } catch (err) {
      setError('Error fetching projects');
    }
  };

  // Fetch a specific task if we are editing
  const fetchTask = async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      setTask(response.data);
      setEditMode(true); // Enable editing mode
      setCurrentTaskId(taskId); // Set current task ID for update
    } catch (err) {
      setError('Error fetching task');
    }
  };

  // Initialize and fetch data
  useEffect(() => {
    // Fetch tasks, users, and projects
    fetchTasks();
    fetchUsers();
    fetchProjects();
  
    // Get the user ID (or username) from localStorage
    const createdBy = localStorage.getItem('id'); // Replace 'id' with the correct key for your user ID
  
    // Set the created_by field for new tasks
    setTask((prevState) => ({
      ...prevState,
      created_by: createdBy || prevState.created_by, // Ensure it's set to createdBy if not already set
    }));
  
  }, []);  // Empty dependency array to run only once when the component mounts
  

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Submit the task form (either create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const combinedTask = {
      ...task,
      start_date: task.start_date, // datetime-local combines date and time
      end_date: task.end_date, // datetime-local combines date and time
    };
  
    try {
      if (editMode) {
        // Update task
        await api.put(`/tasks/${currentTaskId}`, combinedTask);
      } else {
        // Create new task
        await api.post('/tasks', combinedTask);
      }
      setTask({
        title: '',
        description: '',
        assigned_user: '',
        start_date: '',
        end_date: '',
        status: 'Pending',
        priority: 'Medium',
        project_id: '',
        created_by: '',
      }); // Reset form after submit
      setEditMode(false); // Reset edit mode after submission
      setCurrentTaskId(null); // Reset current task ID
      fetchTasks(); // Refresh task list after submit
    } catch (err) {
      setError('Error saving task');
    }
  };
  
  // Delete task
  const handleDelete = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task.id !== taskId)); // Remove task from state
    } catch (err) {
      setError('Error deleting task');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Task Management</h1>

      {/* Error Message */}
      {error && <p className="text-red-600">{error}</p>}

      {/* Loading Message */}
      {loading && <p>Loading tasks...</p>}

      {/* Task Form (Create/Edit) */}
      <div className="bg-white shadow-md p-6 rounded-lg mb-6">
        <h2 className="text-xl font-medium mb-4">{editMode ? 'Edit Task' : 'Create Task'}</h2>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold mb-2">Title:</label>
          <input
            type="text"
            name="title"
            value={task.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          />

          <label className="block text-sm font-semibold mb-2">Description:</label>
          <textarea
            name="description"
            value={task.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          />

          <label className="block text-sm font-semibold mb-2">Assigned User:</label>
          <select
            name="assigned_user"
            value={task.assigned_user}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          >
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>

          <label className="block text-sm font-semibold mb-2">Start Date and Time:</label>
<input
  type="datetime-local"
  name="start_date"
  value={task.start_date}
  onChange={handleChange}
  required
  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
/>

<label className="block text-sm font-semibold mb-2">End Date and Time:</label>
<input
  type="datetime-local"
  name="end_date"
  value={task.end_date}
  onChange={handleChange}
  required
  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
/>


          <label className="block text-sm font-semibold mb-2">Status:</label>
          <select
            name="status"
            value={task.status}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <label className="block text-sm font-semibold mb-2">Priority:</label>
          <select
            name="priority"
            value={task.priority}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <label className="block text-sm font-semibold mb-2">Project:</label>
          <select
            name="project_id"
            value={task.project_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_name}
              </option>
            ))}
          </select>

          
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
          >
            {editMode ? 'Update Task' : 'Create Task'}
          </button>
        </form>
      </div>

      {/* Task List */}
      {!editMode && !loading && (
        <div>
          <h2 className="text-xl font-medium mb-2">Task List</h2>
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 border">Title</th>
                <th className="px-4 py-2 border">Assigned User</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Priority</th>
                <th className="px-4 py-2 border">Project</th>
                <th className="px-4 py-2 border">Start Date</th>
                <th className="px-4 py-2 border">End Date</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
  {tasks.map((task) => (
    <tr key={task.id}>
      <td className="px-4 py-2">{task.title}</td>
      <td className="px-4 py-2">{task.assigned_user}</td>
      <td className="px-4 py-2">{task.status}</td>
      <td className="px-4 py-2">{task.priority}</td>
      <td className="px-4 py-2">{task.project_id}</td>
      <td className="px-4 py-2">{new Date(task.start_date).toLocaleString()}</td>
      <td className="px-4 py-2">{new Date(task.end_date).toLocaleString()}</td>
      <td className="px-4 py-2">
        <button
          onClick={() => fetchTask(task.id)}
          className="bg-yellow-500 text-white py-1 px-2 rounded mr-2"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(task.id)}
          className="bg-red-500 text-white py-1 px-2 rounded"
        >
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
