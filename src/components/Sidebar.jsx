import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    FolderKanban, 
    CheckSquare, 
    LogOut,
    ChevronRight,
    Clock
} from 'lucide-react';

const Sidebar = () => {
    const role = localStorage.getItem('role') || 'member';
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [userName, setUserName] = useState('User');

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Get user name from localStorage
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            setUserName(userData.username || 'User');
        }

        return () => clearInterval(timer);
    }, []);

    const links = {
        admin: [
            { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
            { path: '/users', label: 'Manage Users', icon: <Users className="w-5 h-5" /> },
            { path: '/projects', label: 'Projects', icon: <FolderKanban className="w-5 h-5" /> },
            { path: '/tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
        ],
        engineer: [
          { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { path: '/projects', label: 'Projects', icon: <FolderKanban className="w-5 h-5" /> },
          { path: '/tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
      ],
        member: [
            { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
            { path: '/assignedproject', label: 'Your Projects', icon: <FolderKanban className="w-5 h-5" /> },
            { path: '/assignedtask', label: 'Your Tasks', icon: <CheckSquare className="w-5 h-5" /> },
        ],
        
    };

    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
<aside className="fixed top-0 left-0 w-64 h-screen bg-gradient-to-br from-gray-800 via-gray-600 to-orange-500 text-white shadow-xl">
            {/* User Profile Section */}
            <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-lg font-semibold text-white">Welcome, {userName}</h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <Clock className="w-4 h-4" />
                        <span>{currentTime.toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 mt-4">
                <ul className="space-y-2">
                    {links[role]?.map((link) => (
                        <li key={link.path}>
                            <Link
                                to={link.path}
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 group relative overflow-hidden transition-all duration-300 ease-in-out backdrop-blur-sm"
                            >
                                <span className="flex items-center justify-center w-8 group-hover:scale-110 transition-transform duration-300">
                                    {link.icon}
                                </span>
                                <span className="font-medium">{link.label}</span>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 absolute right-4 transition-all duration-300 transform group-hover:translate-x-1" />
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer with Logout */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-black/20 backdrop-blur-sm">
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full space-x-2 px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-lg group"
                >
                    <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>

            {/* Animated Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 animate-pulse pointer-events-none" />
        </aside>
    );
};

// Add this to your global CSS or style tag
const styles = `
@keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.animate-gradient {
    background-size: 200% 200%;
    animation: gradient 15s ease infinite;
}
`;

export default Sidebar;