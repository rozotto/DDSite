import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MyCourses = ({ userId }) => {
  const [enrollments, setEnrollments] = useState([]);
  const { user_id } = useParams();

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/accounts/user/${user_id}/courses/`)
      .then((response) => {
        setEnrollments(response.data);
      })
      .catch((error) => console.error('Error fetching course details:', error));
  }, [user_id]);

  return (
    <div className="my-courses">
      <Navbar />
      <h1>Мои курсы</h1>
      <ul>
        {enrollments.map((course) => (
          <li key={course.id}>
            <h2>{course.title}</h2>
          </li>
        ))}
      </ul>
      <Footer />
    </div>
  );
};

export default MyCourses;
