import React, { useEffect, useState } from 'react';
import api from '../api'; // Import the API instance

const AssignedTasks = () => {
  const [tasks, setTasks] = useState([]); // State to store tasks
  const [status, setStatus] = useState({}); // State to store the status for each task
  const [message, setMessage] = useState(''); // Message for feedback
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error messages

  const userId = localStorage.getItem('id'); // Get logged-in user ID

  // Enum values for status
  const VALID_STATUSES = ['Pending', 'In Progress', 'Completed', 'Delayed'];

  useEffect(() => {
    if (!userId) {
      setError('User ID not found in localStorage');
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await api.get(`/tasks/assigned/${userId}`);
        console.log('Fetched Assigned Tasks:', response.data);
        setTasks(response.data); // Store fetched tasks in state

        // Initialize status for each task
        const statusMap = {};
        response.data.forEach((task) => {
          statusMap[task.id] = task.status;
        });
        setStatus(statusMap);

        setLoading(false); // Stop loading
      } catch (err) {
        console.error('Error Fetching Assigned Tasks:', err);
        setError('Error fetching assigned tasks');
        setLoading(false); // Stop loading on error
      }
    };

    fetchTasks();
  }, [userId]);

  // Handle status change
  const handleStatusChange = (taskId, newStatus) => {
    setStatus((prevStatus) => ({
      ...prevStatus,
      [taskId]: newStatus,
    }));
  };

  // Handle status update submission
  const handleStatusUpdate = async (taskId) => {
    try {
      const response = await api.put(`/tasks/${taskId}/status`, { status: status[taskId] });
      console.log('Status Update Response:', response.data);

      if (response.data.message === 'Task status updated successfully') {
        setMessage(`Task ${taskId} status updated successfully!`);
      } else {
        setMessage(`Failed to update task ${taskId} status.`);
      }
    } catch (err) {
      console.error('Error Updating Task Status:', err);
      setMessage(`Error updating task ${taskId} status.`);
    }
  };

  // Display loading, error, or tasks
  if (loading) return <div className="text-center text-lg">Loading...</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-center mb-4">My Assigned Tasks</h1>

      {message && <p className="text-center text-blue-500">{message}</p>}

      {tasks.length > 0 ? (
        tasks.map((task) => (
          <div key={task.id} className="border-b pb-4 mb-4">
            <h2 className="text-lg font-bold">{task.title}</h2>
            <p>{task.description}</p>
            <p>
              <strong>Status:</strong>{' '}
              <select
                value={status[task.id] || ''}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                {VALID_STATUSES.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption}
                  </option>
                ))}
              </select>
            </p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Start Date:</strong> {task.start_date}</p>
            <p><strong>End Date:</strong> {task.end_date}</p>
            <p><strong>Assigned By:</strong> {task.created_by_username}</p>
            <button
              onClick={() => handleStatusUpdate(task.id)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Update Status
            </button>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No tasks assigned to you.</p>
      )}
    </div>
  );
};

export default AssignedTasks;
