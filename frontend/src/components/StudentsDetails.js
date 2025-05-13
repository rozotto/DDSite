import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import './StudentsDatails.css';

const LessonDetail = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [description, setDescription] = useState(null);
  const [files, setFiles] = useState([]);
  const [homework, setHomework] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLessonDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/accounts/api/lessons/${lessonId}/files/`);
        if (response.data.status === 'success') {
          setLesson(response.data.lesson_title);
          setDescription(response.data.lesson_description);
          setFiles(response.data.materials || []);
        } else {
          setError(response.data.message || 'Ошибка при загрузке файлов');
        }
      } catch (err) {
        setError('Ошибка при загрузке данных занятия');
        console.error(err);
      }
    };

    fetchLessonDetails();
  }, [lessonId]);

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/accounts/api/lessons/${lessonId}/homework/`);
        if (response.data.status === 'success') {
          setHomework(response.data.assignments || []);
        }
      } catch (err) {
        console.error('Ошибка при загрузке домашнего задания', err);
      }
    };

    fetchHomework();
  }, [lessonId]);

  if (error) return <p className="error-message">{error}</p>;
  if (!lesson) return <p>Загрузка...</p>;

  return (
    <div>
      <Navbar />
      <div className="lesson-detail-container">
        <div className="lesson-info">
          <h2>{lesson}</h2>
          <p>{description}</p>

          <h3>Файлы</h3>
          <ul>
            {files.length > 0 ? (
              files.map((file, index) => (
                <li key={index}>
                  <a href={`http://127.0.0.1:8000${file.url}`} target="_blank" rel="noopener noreferrer">
                    {file.filename || 'Файл'}
                  </a>
                  <br />
                  <small>Размер: {file.size} байт</small><br />
                  <small>Загружен: {file.uploaded_at}</small>
                </li>
              ))
            ) : (
              <p>Файлы отсутствуют</p>
            )}
          </ul>
        </div>
        {/* Блок домашних заданий */}
        <div className="homework-container">
          <h3>Домашнее задание</h3>
          {homework.length > 0 ? (
            <div className="homework-cards">
              {homework.map((assignment) => (
                <div key={assignment.id} className="homework-card">
                  <h4>{assignment.question}</h4>
                  {assignment.image && (
                    <img
                      src={`http://127.0.0.1:8000${assignment.image}`}
                      alt="assignment"
                      className="homework-image"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Домашнее задание не прикреплено</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LessonDetail;
