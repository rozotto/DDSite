import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} stasyyyyyyya</p>
                <div className="footer-links">
                    <a href="/about">О нас</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
