import React, { useEffect, useState } from 'react';
import api from '../api'; // Import the API class

const AssignedProjects = () => {
  const [projects, setProjects] = useState([]); // Change to handle multiple projects
  const [status, setStatus] = useState({});
  const [images, setImages] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get userId from localStorage and handle initial fetch
  const userId = localStorage.getItem('id');

  useEffect(() => {
    if (!userId) {
      setError('User ID not found in localStorage');
      setLoading(false);
      return;
    }

    // Fetch the assigned projects data
    const fetchProjects = async () => {
      try {
        const response = await api.get(`/project/assigned/${userId}`);
        console.log('Backend Response:', response.data); // Log the backend response
        const projectsData = response.data;
        setProjects(projectsData);

        // Pre-populate status for each project
        const statusMap = {};
        projectsData.forEach((project) => {
          statusMap[project.id] = project.status;
        });
        setStatus(statusMap);

        setLoading(false);
      } catch (err) {
        console.error('Error Fetching Assigned Projects:', err); // Log any error during API call
        setError('Error fetching assigned projects');
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId]);

  // Handle status dropdown change
  const handleStatusChange = (projectId, newStatus) => {
    setStatus((prevStatus) => ({
      ...prevStatus,
      [projectId]: newStatus,
    }));
  };

  // Handle file input for images
  const handleFileChange = (projectId, files) => {
    setImages((prevImages) => ({
      ...prevImages,
      [projectId]: files,
    }));
  };

  // Handle form submission for updating project status and uploading images
  const handleSubmit = async (e, projectId) => {
    e.preventDefault();

    if (!status[projectId]) {
      setMessage(`Status is required for project ${projectId}.`);
      return;
    }

    // Create form data to send status, project_id, and images
    const formData = new FormData();
    formData.append('status', status[projectId]);
    formData.append('project_id', projectId);

    if (images[projectId]) {
      Array.from(images[projectId]).forEach((image, index) => {
        formData.append('images', image);
      });
    }

    try {
      const response = await api.put(`/project/assigned/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Form Submit Response:', response.data); // Log response
      if (response.data.message === 'Project updated successfully') {
        setMessage(`Project ${projectId} updated successfully!`);

        // Re-fetch the updated projects data
        const updatedResponse = await api.get(`/project/assigned/${userId}`);
        console.log('Updated Projects Response:', updatedResponse.data);
        setProjects(updatedResponse.data); // Update the local state with the new data
        setImages((prevImages) => ({
          ...prevImages,
          [projectId]: [], // Clear the images for this project after successful upload
        }));
      } else {
        setMessage(`Failed to update project ${projectId}.`);
      }
    } catch (err) {
      console.error('Error Submitting Form:', err);
      setMessage(`Error updating project ${projectId}.`);
    }
  };

  // Display loading, error, or project details
  if (loading) return <div className="text-center text-lg">Loading...</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-center mb-4">Assigned Projects</h1>

      {message && <p className="text-center text-blue-500">{message}</p>}

      {projects.length > 0 ? (
        projects.map((project) => (
          <div key={project.id} className="border-b pb-4 mb-4">
            <div className="space-y-4">
              <h2 className="text-xl font-bold">{project.project_name}</h2>
              <p>{project.description}</p>
              <p><strong>Status:</strong> {status[project.id]}</p>
              <p><strong>Budget:</strong> ${project.budget}</p>
              <p><strong>Location:</strong> {project.location}</p>
              <p><strong>Assigned User:</strong> {project.assigned_user}</p>

              {/* Display existing images */}
              <div className="flex flex-wrap gap-4 mt-4">
                {project.images && project.images.length > 0 ? (
                  project.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Project Image ${index}`}
                      className="w-32 h-32 object-cover rounded-lg shadow-md"
                    />
                  ))
                ) : (
                  <p>No images available.</p>
                )}
              </div>
            </div>

            {/* Form for updating the project */}
            <form className="mt-6 space-y-4" onSubmit={(e) => handleSubmit(e, project.id)}>
              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  value={status[project.id] || ''}
                  onChange={(e) => handleStatusChange(project.id, e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="" disabled>Select Status</option>
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Upload Images</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(project.id, e.target.files)}
                  className="mt-1 block w-full text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
              >
                Update Project
              </button>
            </form>
          </div>
        ))
      ) : (
        <p>No assigned projects.</p>
      )}
    </div>
  );
};

export default AssignedProjects;
