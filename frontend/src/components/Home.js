import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import image_anime from './image_anime.jpg';
import './Home.css';

const Home = () => {
    const [displayedText, setDisplayedText] = useState('');
    const fullText = " DD — это образовательная платформа, специализирующаяся на подготовке к ЕГЭ по информатике. Мы предлагаем доступ к современным учебным материалам.";


    useEffect(() => {
        let index = 0;
        let timer;

        const addLetter = () => {
            if (index+1 < fullText.length) {
                setDisplayedText(prev => prev + fullText[index]);
                index++;
                timer = setTimeout(addLetter, 70);
            } else {
                clearTimeout(timer);
            }
        };

        addLetter();
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="home-container">
            <Navbar />
            <div className="home-content">
                <div className="home-text-section">
                    <h1>{displayedText}</h1>
                </div>
                <div className="home-image-section">
                    <img src={image_anime} alt="картинка" className="home-profile-image" />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
