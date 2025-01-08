import React, { useState, useEffect } from 'react';
import api from '../api';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'member' });
    const [editUser, setEditUser] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch users from the API
    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle input changes for the add/edit user form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (editUser) {
            setEditUser({ ...editUser, [name]: value });
        } else {
            setNewUser({ ...newUser, [name]: value });
        }
    };

    // Add a new user
    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/register', newUser);
            setSuccess('User added successfully');
            setError('');
            setNewUser({ username: '', email: '', password: '', role: 'member' });
            fetchUsers();
        } catch (err) {
            setError('Error adding user');
            setSuccess('');
        }
    };

    // Edit an existing user
    const handleEditUser = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/${editUser.id}`, {
                username: editUser.username,
                email: editUser.email,
                role: editUser.role,
            });
            setSuccess('User updated successfully');
            setError('');
            setEditUser(null);
            fetchUsers();
        } catch (err) {
            setError('Error updating user');
            setSuccess('');
        }
    };

    // Delete a user
    const handleDeleteUser = async (id) => {
        try {
            await api.delete(`/users/${id}`);
            setSuccess('User deleted successfully');
            setError('');
            fetchUsers();
        } catch (err) {
            setError('Error deleting user');
            setSuccess('');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Manage Users</h1>

            {/* Success and Error Messages */}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* User List */}
            <h2>Existing Users</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Username</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Role</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.id}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.username}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.role}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <button
                                    onClick={() => setEditUser(user)}
                                    style={{
                                        marginRight: '10px',
                                        padding: '5px 10px',
                                        backgroundColor: 'blue',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    style={{
                                        padding: '5px 10px',
                                        backgroundColor: 'red',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Add or Edit User Form */}
            <h2>{editUser ? 'Edit User' : 'Add New User'}</h2>
            <form onSubmit={editUser ? handleEditUser : handleAddUser} style={{ maxWidth: '400px' }}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={editUser ? editUser.username : newUser.username}
                    onChange={handleInputChange}
                    required
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                    }}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={editUser ? editUser.email : newUser.email}
                    onChange={handleInputChange}
                    required
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                    }}
                />
                {!editUser && (
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={newUser.password}
                        onChange={handleInputChange}
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                        }}
                    />
                )}
                <select
                    name="role"
                    value={editUser ? editUser.role : newUser.role}
                    onChange={handleInputChange}
                    required
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                    }}
                >
                    <option value="member">Member</option>
                    <option value="engineer">Engineer</option>
                    <option value="admin">Admin</option>
                </select>
                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: 'green',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    {editUser ? 'Update User' : 'Add User'}
                </button>
            </form>
        </div>
    );
};

export default ManageUsers;
