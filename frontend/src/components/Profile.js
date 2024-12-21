import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { UserContext } from './UserContext';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { logout } = useContext(UserContext);

    const handleLogout = () => {
        logout();
        window.location.reload();
    };

    useEffect(() => {
        const fetchProfile = () => {
            const storedUser = localStorage.getItem('user');

            if (!storedUser) {
                setError('Пользователь не найден. Авторизуйтесь.');
                setLoading(false);
                return navigate('/login');
            }

            const userData = JSON.parse(storedUser);
            setUser(userData);
            setLoading(false);
        };

        fetchProfile();
    }, [navigate]);

    if (loading) {
        return <p>Загрузка...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div className="profile-container">
            <h1>Страница профиля</h1>
            {user ? (
                <>
                    <img
                        src={user.profile_photo || 'default-profile.png'}
                        alt="Profile"
                        className="profile-photo-large"
                    />
                    <h2>{user.username}</h2>
                    <p>Email: {user.email}</p>
                    <div className="dropdown-menu">
                        <button className="logout-button" onClick={handleLogout}>Выйти</button>
                    </div>
                </>
            ) : (
                <p>Данные профиля не найдены.</p>
            )}
        </div>
    );
};

export default Profile;
