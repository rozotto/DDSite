import React from 'react';
import Navbar from './Navbar';
import './Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <Navbar />

            <div className="content">
                <h1>Добро пожаловать!!</h1>
            </div>
        </div>
    );
};

export default Home;
