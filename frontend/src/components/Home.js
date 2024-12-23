import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './Home.css';
import image_anime from './image_anime.jpg';

const Home = () => {
    return (
        <div className="home-container">
            <Navbar />
            <div className="content">
                <div className="text-section">
                    <h1>Добро пожаловать в мир геймифицированного обучения!</h1>
                    <p>Мы понимаем, что традиционные методы обучения могут быть скучными и неэффективными. 
                        Поэтому мы разработали уникальную систему, которая позволяет вам учиться в своем темпе, 
                        устанавливая собственные цели и получая награды за достижения. 
                        Наши курсы охватывают широкий спектр тем — от технологий до искусства — и подходят для всех возрастов. 
                        Присоединяйтесь к нашему сообществу и откройте для себя новые горизонты знаний в увлекательной форме!</p>
                </div>
                <div className="image-section">
                    <img src={image_anime} alt="картинка" className="profile-image" />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
