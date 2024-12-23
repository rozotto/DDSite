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
                    <Link to="/home">
                        <img src={logo} alt="Logo" className="logo" />
                    </Link>
                </header>
                <h1 className="project-title">GameWise</h1>
            </div>

            <ul className="nav-links">
                <li><Link to="/catalog" className="btn">КАТАЛОГ</Link></li>
                <li><Link to="/my-courses" className="btn">МОИ КУРСЫ</Link></li>
                <li><Link to="/leaderboard" className="btn">ЛИДЕРБОРД</Link></li>
                <li><Link to="/about" className="btn">О ПРОЕКТЕ</Link></li>
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
