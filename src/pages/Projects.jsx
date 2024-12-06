import React, { useEffect, useState } from 'react';
import api from '../api'; // Import your axios instance
import { Snackbar, Alert, CircularProgress } from '@mui/material';

const AdminProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]); // To fetch users from DB (only members)
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    status: 'planning',
    start_date: '',
    end_date: '',
    budget: '',
    project_manager: '',
    location: '',
    assigned_user: '', // Single user (user_id)
    images: [], // Multiple images
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Snackbar state for error messages
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all projects
    api.get('/projects')
      .then((response) => {
        setProjects(response.data || []); // Ensure projects is always an array
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setErrorMessage('Error fetching projects');
        setOpenSnackbar(true);
        console.error('Error fetching projects:', error);
      });

      api.get('/projects/users')
      .then((response) => {
        setUsers(response.data || []); // Assuming response.data is an array of users
      })
      .catch((error) => {
        setErrorMessage('Error fetching users');
        setOpenSnackbar(true);
        console.error('Error fetching users:', error);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const { files } = e.target;
    setFormData({
      ...formData,
      images: Array.from(files), // Save all selected files
    });
  };

  const handleUserChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      assigned_user: value, // Store user_id of the selected user
    });
  };
  
  

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const projectData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'images') {
        formData.images.forEach((image) => {
          projectData.append('images', image);
        });
      } else {
        projectData.append(key, formData[key]);  // This should include assigned_user as user.id
      }
    });
  
    if (isEditing) {
      // Update the project
      api.put(`/projects/${editingProject.id}`, projectData)
        .then((response) => {
          alert('Project updated successfully');
          setProjects((prevProjects) =>
            prevProjects.map((project) =>
              project.id === editingProject.id ? { ...project, ...formData } : project
            )
          );
          resetForm();
        })
        .catch((error) => {
          setErrorMessage('Error updating project');
          setOpenSnackbar(true);
          console.error('Error updating project:', error);
        });
    } else {
      // Create new project
      api.post('/projects', projectData)
        .then((response) => {
          alert('Project added successfully');
          setProjects([...projects, response.data]);
          resetForm();
        })
        .catch((error) => {
          setErrorMessage('Error adding project');
          setOpenSnackbar(true);
          console.error('Error adding project:', error);
        });
    }
  };
  
  
  const resetForm = () => {
    setFormData({
      project_name: '',
      description: '',
      status: 'planning',
      start_date: '',
      end_date: '',
      budget: '',
      project_manager: '',
      location: '',
      assigned_user: '',
      images: [],
    });
    setIsEditing(false);
    setEditingProject(null);
  };

  const handleDelete = (projectId) => {
    api.delete(`/projects/${projectId}`)
      .then(() => {
        alert('Project deleted successfully');
        setProjects(projects.filter((project) => project.id !== projectId));
      })
      .catch((error) => {
        setErrorMessage('Error deleting project');
        setOpenSnackbar(true);
        console.error('Error deleting project:', error);
      });
  };

  const handleEdit = (project) => {
    setIsEditing(true);
    setEditingProject(project);
    setFormData({
      project_name: project.project_name,
      description: project.description,
      status: project.status,
      start_date: project.start_date,
      end_date: project.end_date,
      budget: project.budget,
      project_manager: project.project_manager,
      location: project.location,
      assigned_user: project.assigned_user || '', // User ID of assigned user
      images: [], // Clear image field for editing
    });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <CircularProgress />
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Project Management</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">{isEditing ? 'Update Project' : 'Add New Project'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="project_name"
            value={formData.project_name}
            onChange={handleInputChange}
            placeholder="Project Name"
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleInputChange}
            placeholder="Budget"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Location"
            className="w-full p-2 border rounded"
            required
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="delayed">Delayed</option>
          </select>
          <input
            type="file"
            name="images"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
            multiple
          />
         <select
  name="assigned_user"
  value={formData.assigned_user}
  onChange={handleUserChange}
  className="w-full p-2 border rounded"
  required
>
  <option value="">Select User</option>
  {users.map((user) => (
    <option key={user.id} value={user.id}> {/* Use user.id */}
      {user.username} {/* Displaying the username */}
    </option>
  ))}
</select>


          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            {isEditing ? 'Update Project' : 'Add Project'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Projects</h2>
        <table className="min-w-full bg-white border border-gray-200">
  <thead>
    <tr>
      <th className="border p-2">Project Name</th>
      <th className="border p-2">Status</th>
      <th className="border p-2">Location</th>
      <th className="border p-2">Start Date</th>
      <th className="border p-2">End Date</th>
      <th className="border p-2">Budget</th>
      <th className="border p-2">Assigned User</th>
      <th className="border p-2">Images</th>
      <th className="border p-2">Actions</th>
    </tr>
  </thead>
  <tbody>
    {projects.length > 0 ? (
      projects.map((project) => (
        <tr key={project.id}>
          <td className="border p-2">{project.project_name}</td>
          <td className="border p-2">{project.status}</td>
          <td className="border p-2">{project.location}</td>
          <td className="border p-2">{project.start_date}</td>
          <td className="border p-2">{project.end_date}</td>
          <td className="border p-2">{project.budget}</td>
          <td className="border p-2">{project.assigned_user}</td>
          <td className="border p-2">
            {project.images && project.images.length > 0 ? (
              <div>
                {project.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`project-image-${index}`}
                    className="w-20 h-20 object-cover m-1"
                  />
                ))}
              </div>
            ) : (
              <p>No images available</p>
            )}
          </td>
          <td className="border p-2">
            <button
              onClick={() => handleEdit(project)}
              className="text-blue-500"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(project.id)}
              className="text-red-500 ml-4"
            >
              Delete
            </button>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="10" className="border p-2 text-center">
          No projects found.
        </td>
      </tr>
    )}
  </tbody>
</table>

      </div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminProjectPage;
