import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/accounts/api/course/${id}/`)
      .then((response) => {
        setCourse(response.data);
        setLoading(false);
      })
      .catch((error) => console.error('Error fetching course details:', error));
  }, [id]);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="course-detail">
      <Navbar />
      <div className="course-content">
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <h2>Содержание курса:</h2>
        <div className="course-content-details">{course.content}</div>
        <div className="course-buttons">
          <button onClick={() => navigate(`/courses/${id}/add-form`)}>Добавить форму</button>
          <button onClick={() => navigate(`/courses/${id}/quiz`)}>Пройти тест</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseDetail;
