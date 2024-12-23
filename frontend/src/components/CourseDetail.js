import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/accounts/course/${id}/`)
      .then((response) => {
        setCourse(response.data);
        setLoading(false);
      })
      .catch((error) => console.error('Error fetching course details:', error));
  }, [id]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="course-detail">
    <Navbar />
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <p>Содержание курса:</p>
      <div>{course.content}</div>
      <Footer />
    </div>
  );
};

export default CourseDetail;
