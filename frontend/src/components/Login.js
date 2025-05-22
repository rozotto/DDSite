import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Register.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(UserContext);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1. Отправляем данные для входа
            const response = await axios.post(
                'http://127.0.0.1:8000/accounts/api/login/',
                formData
            );

            if (response.status === 200) {
                // 2. Получаем профиль пользователя
                const profileResponse = await axios.get(
                    `http://127.0.0.1:8000/accounts/api/profile/?userid=${response.data.userid}`
                );

                login(profileResponse.data);

                navigate('/');
            }
        } catch (error) {
            setMessage(error.response?.data?.error || 'Ошибка входа');
            console.error('Login error:', error);
        }
    };

    return (
        <div className="form-container">
            <h1>Вход</h1>
            <form onSubmit={handleSubmit}>
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
                    placeholder="Пароль"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Войти</button>
            </form>

            {message && <p className="error-message">{message}</p>}

            <div className="switch-container">
                <p>
                    Впервые у нас?
                    <span onClick={() => navigate('/register')}> Регистрация</span>
                </p>
            </div>
        </div>
    );
};

export default Login;