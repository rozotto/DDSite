import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} alistkova, pepengu, rozotto, ivanuilC. Все права защищены.</p>
                <div className="footer-links">
                    <a href="#about">О нас</a>
                    <a href="#contact">Контакты</a>
                </div>
            </div>
        </footer>
    );
};

