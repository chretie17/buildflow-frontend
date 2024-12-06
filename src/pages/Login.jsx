import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const LoginPage = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/users/login', { identifier, password });
            const { user } = response.data;

            // Save user details in localStorage
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('username', user.username);
            localStorage.setItem('role', user.role);
            localStorage.setItem('id', user.id);

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid username/email or password');
        }
    };

    return (
        <div style={{ maxWidth: '300px', margin: '100px auto', textAlign: 'center' }}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username or Email"
                    style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007BFF', color: '#fff' }}>
                    Login
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default LoginPage;
