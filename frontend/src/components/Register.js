import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password2: '',
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(UserContext);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.password2) {
            setMessage('Пароли не совпадают');
            return;
        }

        const password = formData.password;
        const hasNumber = /\d/.test(password);
        if (password.length < 8 || !hasNumber) {
            setMessage('Пароль должен быть не короче 8 символов и содержать хотя бы одну цифру');
            return;
        }

        const formDataObj = new FormData();
        formDataObj.append("first_name", formData.first_name);
        formDataObj.append("last_name", formData.last_name);
        formDataObj.append("email", formData.email);
        formDataObj.append("password", formData.password);
        formDataObj.append("password2", formData.password2);

        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/accounts/api/register/',
                formDataObj,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.status === 201) {
                setMessage(response.data.message || 'Регистрация успешна!');

                try {
                    const loginResponse = await axios.post(
                        'http://127.0.0.1:8000/accounts/api/login/',
                        {
                            email: formData.email,
                            password: formData.password
                        }
                    );

                    if (loginResponse.status === 200) {
                        const profileResponse = await axios.get(
                            `http://127.0.0.1:8000/accounts/api/profile/?userid=${loginResponse.data.userid}`
                        );

                        login(profileResponse.data);

                        navigate('/');
                    }
                } catch (loginError) {
                    console.error('Auto-login failed:', loginError);
                    navigate('/login');
                }
            }
        } catch (error) {
            setMessage(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Произошла ошибка при регистрации"
            );
        }
    };

    return (
        <div className="form-container">
            <h1>Регистрация</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="first_name"
                    placeholder="Имя"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="last_name"
                    placeholder="Фамилия"
                    value={formData.last_name}
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
                    placeholder="Пароль"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                />
                <input
                    type="password"
                    name="password2"
                    placeholder="Подтвердите пароль"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                    minLength={8}
                />
                <button type="submit">Зарегистрироваться</button>
            </form>

            {message && (
                <p className={message.includes('успешна') ? 'success-message' : 'error-message'}>
                    {message}
                </p>
            )}

            <div className="switch-container">
                <p>
                    Уже есть аккаунт?
                    <span
                        className="switch-link"
                        onClick={() => navigate('/login')}
                    >
                        Вход
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Register;