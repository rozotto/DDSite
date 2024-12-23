import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import math from './math.jpg';

const Catalog = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/accounts/api/courses/')
      .then((response) => setCourses(response.data))
      .catch((error) => console.error('Error fetching courses:', error));
  }, []);

  const handleCourseClick = (id) => {
    navigate(`/courses/${id}`);
  };

  return (
    <div className="catalog">
    <Navbar />
      <h1>Каталог курсов</h1>
      <div className='course-list'>
          {courses.map((course) => (
            <div className='course-card' key={course.id}> 
              <h2>{course.title}</h2>
              <img src={math} alt={course.title} className="course-image" />
              <button onClick={() => handleCourseClick(course.id)} className='course-button'>
                Перейти к курсу
              </button>
            </div>
          ))}
      </div>
      <Footer />
    </div>
  );
};

export default Catalog;
