import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Navbar.css';
import logo from './logo.png';

const Navbar = () => {
    const { user } = useContext(UserContext);

    return (
        <nav className="navbar">
            <div className="app-container">
                <header>
                    <Link to="/" className="logo-title-link">
                        <div className="logo-title-wrapper">
                            <img src={logo} alt="Logo" className="logo" />
                        </div>
                    </Link>
                </header>
            </div>

            <ul className="nav-links">
                {user && user.is_staff ? (
                    <>
                        <li><Link to="/students" className="btn">УЧЕНИКИ</Link></li>
                        <li><Link to="/lessons" className="btn">ДОБАВИТЬ УРОК</Link></li>
                        <li><Link to="/complete_lessons" className="btn">ЗАНЯТИЯ</Link></li>
                        <li><Link to="/courses" className="btn">СОЗДАТЬ КУРС</Link></li>
                        <li><Link to="/base" className="btn">БАЗА ЗАДАНИЙ</Link></li>
                    </>
                ) : user ? (
                    <>
                        <li><Link to="/my_courses" className="btn">КУРСЫ</Link></li>
                    </>
                ) : null}
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
                        <Link to="/login" className="auth-button">Log In</Link>
                        <Link to="/register" className="auth-button">Sign Up</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
