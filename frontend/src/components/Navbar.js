import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Navbar.css';

const Navbar = () => {
    const { user } = useContext(UserContext);

    return (
        <nav className="navbar">
            <div className="logo"></div>
            <ul className="nav-links">
                <li><a href="/catalog">Каталог</a></li>
                <li><a href="/my-courses">Мои курсы</a></li>
                <li><a href="/leaderboard">Лидерборд</a></li>
                <li><a href="/about">О проекте</a></li>
            </ul>
            <div className="search-container">
                <input type="text" placeholder="Placeholder" />
                <button className="search-button">X</button>
            </div>
            <div className="auth-buttons">
                {user ? (
                    <div className="profile-dropdown">
                    <Link to={`/profile`}>
                        <img
                            src={user.profile_photo || 'default-avatar.png'}
                            alt="Profile"
                            className="profile-avatar"
                        />
                    </Link>
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/login" className="auth-button">Вход</Link>
                        <Link to="/register" className="auth-button">Регистрация</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
