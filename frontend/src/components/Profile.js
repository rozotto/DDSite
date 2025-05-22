import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { UserContext } from './UserContext';
import Navbar from './Navbar';
import Footer from './Footer';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        profile_photo: null
    });
    const navigate = useNavigate();
    const { logout } = useContext(UserContext);

    const handleLogout = () => {
        logout();
        window.location.reload();
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const storedUser = localStorage.getItem('user');

            if (!storedUser) {
                setError('Пользователь не найден. Авторизуйтесь.');
                setLoading(false);
                return navigate('/login');
            }

            const userData = JSON.parse(storedUser);
            setUser(userData);
            setFormData({
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                email: userData.email || '',
                profile_photo: null
            });
            setLoading(false);
        };

        fetchProfile();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, profile_photo: e.target.files[0] });
    };

    const handleSave = async () => {
        if (!user) return;

        const formDataToSend = new FormData();
        formDataToSend.append('first_name', formData.first_name);
        formDataToSend.append('last_name', formData.last_name);
        formDataToSend.append('email', formData.email);
        if (formData.profile_photo) {
            formDataToSend.append('profile_photos', formData.profile_photo);
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/accounts/api/users/${user.id}/edit/`, {
                method: 'POST',
                body: formDataToSend,
            });

            const data = await response.json();

            if (data.status === 'success') {
                alert('Профиль успешно обновлен!');
                const updatedUser = {
                    ...user,
                    username: formData.username,
                    email: formData.email,
                    profile_photo: formData.profile_photo ? URL.createObjectURL(formData.profile_photo) : user.profile_photo,
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setIsEditing(false);
            } else {
                alert(data.message || 'Ошибка при обновлении профиля');
            }
        } catch (error) {
            alert('Ошибка при отправке данных на сервер');
            console.error(error);
        }
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className="profile-container">
            <Navbar />
            {user ? (
                <div className="profile-content">
                    <img
                        src={user.profile_photo || 'default-profile.png'}
                        alt="Profile"
                        className="profile-photo"
                    />
                    {isEditing ? (
                        <div className="edit-form">
                            <label>
                                Имя:
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label>
                                Фамилия:
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label>
                                Email:
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label>
                                Фото профиля:
                                <input
                                    type="file"
                                    name="profile_photo"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                            <div className="form-buttons">
                                <button className="save-button" onClick={handleSave}>Сохранить</button>
                                <button className="cancel-button" onClick={() => setIsEditing(false)}>Отмена</button>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-details">
                            <h2>{user.first_name} {user.last_name}</h2>
                            <p>Email: {user.email}</p>
                            <div className="profile-buttons">
                                <button className="nav-button" onClick={() => navigate(`/`)}>На главную</button>
                                <button className="edit-button" onClick={() => setIsEditing(true)}>Редактировать</button>
                                <button className="logout-button" onClick={handleLogout}>Выйти</button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <p>Данные профиля не найдены.</p>
            )}
            <Footer />
        </div>
    );
};

export default Profile;