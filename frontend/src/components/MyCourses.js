import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';

const MyCourses = () => {
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserCourses = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          throw new Error('User data not found in localStorage.');
        }

        const userData = JSON.parse(storedUser);
        if (!userData || !userData.id) {
          throw new Error('Invalid user data.');
        }

        setUser(userData);

        const coursesResponse = await axios.get(`http://127.0.0.1:8000/accounts/user/${userData.id}/courses/`);
        setEnrollments(coursesResponse.data.courses);
      } catch (err) {
        setError('Не удалось загрузить курсы.');
        console.error('Error fetching user courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCourses();
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  const handleCourseClick = (id) => {
    navigate(`/courses/${id}`);
  };

  return (
    <div className="my-courses">
      <Navbar />
      <h1>Мои курсы</h1>
      <ul>
        {enrollments.length > 0 ? (
          enrollments.map((course) => (
            <li key={course.id} onClick={() => handleCourseClick(course.id)}>
                <h2>{course.title}</h2>
            </li>
          ))
        ) : (
          <p>У вас пока нет курсов.</p>
        )}
      </ul>
      <Footer />
    </div>
  );
};

export default MyCourses;
