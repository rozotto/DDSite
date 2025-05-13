import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataObj = new FormData();
        formDataObj.append("username", formData.username);
        formDataObj.append("email", formData.email);
        formDataObj.append("password", formData.password);
        formDataObj.append("password2", formData.password2);

        try {
            const response = await axios.post('http://127.0.0.1:8000/accounts/api/register/', formDataObj, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(response.data.message);
            if (response.status === 201) {
                navigate('/home');
            }
        } catch (error) {
            setMessage(error.response?.data?.error || "An error occurred");
        }
    };

    return (
        <div className="form-container">
            <h1>Register</h1>
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
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
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
                <input
                    type="password"
                    name="password2"
                    placeholder="Confirm Password"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Register</button>
            </form>

            {message && <p>{message}</p>}

            <div className="switch-container">
                <p>
                    Already have an account?
                    <span onClick={() => navigate('/login')}> Login</span>
                </p>
            </div>
        </div>
    );
};

export default Register;
