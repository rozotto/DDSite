import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './components/UserContext';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import About from './components/About';
import Students from './components/Students';
import Lessons from './components/Lessons';
import LessonList from './components/LessonList';
import LessonDetail from './components/LessonDetail';
import StudentsLessons from './components/StudentsLessons';
import StudentsDetails from './components/StudentsDetails';
import Assignment from './components/Assignment';

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
                    <Route path="/students" element={<Students />} />
                    <Route path="/lessons" element={<Lessons />} />
                    <Route path="/complete_lessons" element={<LessonList />} />
                    <Route path="/lessons/:lessonId" element={<LessonDetail />} />
                    <Route path="/lessons_for_students" element={<StudentsLessons />} />
                    <Route path="/lessons_for_students/:lessonId" element={<StudentsDetails />} />
                    <Route path="/base" element={<Assignment />} />
                </Routes>
            </Router>
        </UserProvider>
    );
}

export default App;
