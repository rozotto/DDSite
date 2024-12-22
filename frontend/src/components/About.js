import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './About.css';

const About = () => {
    return (
        <div className="about-container">
            <Navbar />
            
            <div className="about-text">
                <h1>О нас</h1>
                <p>
                Мы — команда молодых разработчиков, студентов Санкт-Петербургского государственного университета, объединенных страстью к инновациям и технологиям. 
                Наша цель — создать уникальную платформу для геймифицированного обучения, которая сделает процесс получения знаний более увлекательным и доступным. 
                Мы верим, что обучение может быть не только полезным, но и интересным, поэтому активно внедряем элементы игры в образовательный процесс.
                </p>
            </div>

            <div className="about-section">
                <div className="image-section">
                    <img src={cat1} alt="фото один" className="profile-image" />
                </div>
                <div className="text-section">
                    <h2>Листкова Александра</h2>
                    <p>
                        я старалась
                    </p>
                </div>
            </div>

            <div className="about-section reverse">
                <div className="image-section">
                    <img src={cat2} alt="фото два" className="profile-image" />
                </div>
                <div className="text-section">
                    <h2>Плотников Даниил</h2>
                    <p>
                        крутой
                    </p>
                </div>
            </div>

            <div className="about-section">
                <div className="image-section">
                    <img src={cat3} alt="фото три" className="profile-image" />
                </div>
                <div className="text-section">
                    <h2>Егоров Иван</h2>
                    <p>
                        если встретите птицу киви это он
                    </p>
                </div>
            </div>

            <div className="about-section reverse">
                <div className="image-section">
                    <img src={cat4} alt="фото четыре" className="profile-image" />
                </div>
                <div className="text-section">
                    <h2>Егоров Дмитрий</h2>
                    <p>
                        он не брат Егорова Ивана
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default About;
