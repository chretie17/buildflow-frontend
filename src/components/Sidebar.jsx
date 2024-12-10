import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const role = localStorage.getItem('role') || 'member'; // Default to 'member'
  const navigate = useNavigate();

  // Sidebar links based on user role
  const links = {
    admin: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/users', label: 'Manage Users' },
      { path: '/projects', label: 'Projects' },
      { path: '/tasks', label: 'Tasks' },
    ],
    member: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/assignedproject', label: 'Your Projects' },
      { path: '/assignedtask', label: 'Your Tasks' },
    ],
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-gray-800 text-white">
      <div className="p-6 text-2xl font-semibold text-center text-white border-b border-gray-700">
        Menu
      </div>
      <ul className="space-y-4 p-6">
        {links[role]?.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className="block py-2 px-4 rounded-lg text-white hover:bg-blue-600 transition duration-300 ease-in-out"
            >
              {link.label}
            </Link>
          </li>
        ))}
        <li>
          <button
            onClick={handleLogout}
            className="w-full text-left py-2 px-4 mt-6 rounded-lg text-white bg-red-600 hover:bg-red-700 transition duration-300 ease-in-out"
          >
            Logout
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
