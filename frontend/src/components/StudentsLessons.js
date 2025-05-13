import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './LessonList.css';

const LessonList = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/accounts/api/complete_lessons/');
        setLessons(response.data);
      } catch (err) {
        setError('Ошибка при загрузке уроков');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const handleCardClick = (lessonId) => {
    navigate(`/lessons_for_students/${lessonId}`);
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <Navbar />
      <div className="lesson-list-container">
        <h2>Список занятий</h2>
        {lessons.length === 0 ? (
          <p>Нет доступных занятий.</p>
        ) : (
          <div className="lesson-cards">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="lesson-card"
                onClick={() => handleCardClick(lesson.id)}
              >
                <h3>{lesson.title}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default LessonList;
