import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './components/UserContext';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import About from './components/About';
import Catalog from './components/Catalog';
import MyCourses from './components/MyCourses';
import CourseDetail from './components/CourseDetail';
import Leaderboard from './components/Leaderboard';
import CourseForm from './components/CourseForm';
import CourseQuiz from './components/CourseQuiz';

function App() {
    return (
        <UserProvider>
            <Router>
                <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/catalog" element={<Catalog />} />
                    <Route path="/my-courses" element={<MyCourses />} />
                    <Route path="/courses/:id" element={<CourseDetail />} />
                    <Route path="/courses/:id/add-form" element={<CourseForm />} />
                    <Route path="/courses/:id/quiz" element={<CourseQuiz />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                </Routes>
            </Router>
        </UserProvider>
    );
}

export default App;
