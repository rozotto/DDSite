import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/accounts/api/profile/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((response) => setEnrollments(response.data.enrollments))
      .catch((error) => console.error('Error fetching enrollments:', error));
  }, []);

  return (
    <div className="my-courses">
      <Navbar />
      <h1>Мои курсы</h1>
      <ul>
        {enrollments.map((enrollment) => (
          <li key={enrollment.course.id}>
            <h2>{enrollment.course.title}</h2>
            <p>{enrollment.course.description}</p>
            <p>Дата записи: {enrollment.enrollment_date}</p>
          </li>
        ))}
      </ul>
      <Footer />
    </div>
  );
};

export default MyCourses;
