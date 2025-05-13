import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:8000/accounts/api/login/', formData);

            if (response.status === 200) {
                const profileResponse = await axios.get(
                    `http://127.0.0.1:8000/accounts/api/profile/?userid=${response.data.userid}`
                );

                localStorage.setItem('user', JSON.stringify(profileResponse.data));
                navigate('/home');
            }
        } catch (error) {
            setMessage(error.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="form-container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Login</button>
            </form>

            {message && <p>{message}</p>}

            <div className="switch-container">
                <p>
                    Don&apos;t have an account?
                    <span onClick={() => navigate('/register')}> Register</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
