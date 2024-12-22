import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Navbar.css';
import logo from './logo.jpg';

const Navbar = () => {
    const { user } = useContext(UserContext);

    return (
        <nav className="navbar">
            <div className="app-container">
                <header>
                    <img src={logo} alt="Logo" className="logo" />
                    <h1 className="project-title">GameWise</h1>
                </header>
            </div>

            <ul className="nav-links">
                <li><Link to="/catalog" className="btn">Каталог</Link></li>
                <li><Link to="/my-courses" className="btn">Мои курсы</Link></li>
                <li><Link to="/leaderboard" className="btn">Лидерборд</Link></li>
                <li><Link to="/about" className="btn">О проекте</Link></li>
                  </ul>
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
