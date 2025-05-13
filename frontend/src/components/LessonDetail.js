import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import './LessonDetail.css';

const LessonDetail = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [description, setDescription] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [allAssignments, setAllAssignments] = useState([]);
  const [selectedAssignmentIds, setSelectedAssignmentIds] = useState([]);
  const [homework, setHomework] = useState([]);
  const navigate = useNavigate();

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
    const fetchAssignments = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/accounts/api/assignments/');
        if (res.data.status === 'success') {
          setAllAssignments(res.data.assignments);
        }
      } catch (err) {
        console.error('Ошибка при загрузке заданий', err);
      }
    };

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
    fetchAssignments();
  }, []);

  const toggleAssignment = (id) => {
    setSelectedAssignmentIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const submitHomework = async () => {
    try {
      const res = await axios.post(`http://127.0.0.1:8000/accounts/api/lessons/${lessonId}/homework/`, {
        assignment_ids: selectedAssignmentIds
      });
      if (res.data.status === 'success') {
        alert('Домашнее задание успешно составлено');
      }
    } catch (err) {
      alert('Ошибка при сохранении домашнего задания');
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!file) return alert("Выберите файл");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/accounts/api/lessons/${lessonId}/upload_files/`,
        formData
      );
      if (response.data.status === 'success') {
        alert('Файл успешно добавлен');
        navigate(`/lessons/${lessonId}`);
      }
    } catch (err) {
      alert('Ошибка при добавлении файла');
      console.error(err);
    }
  };

  if (error) return <p className="error-text">{error}</p>;
  if (!lesson) return <p className="loading-text">Загрузка...</p>;

  return (
    <div>
      <Navbar />
      <div className="lesson-detail-container">
        <h2>{lesson}</h2>
        <p>{description}</p>

        <h3>Файлы</h3>
        <form onSubmit={handleFileUpload}>
          <input type="file" onChange={handleFileChange} />
          <button type="submit">Загрузить файл</button>
        </form>

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

        <h3>Домашнее задание</h3>
        {homework.length > 0 ? (
          <div className="assignment-select-grid">
            {homework.map((assignment) => (
              <div key={assignment.id} className="assignment-card">
                <h4>{assignment.question}</h4>
                {assignment.image && (
                  <img
                    src={`http://127.0.0.1:8000${assignment.image}`}
                    alt="assignment"
                  />
                )}
                <p><strong>Ответ:</strong> {assignment.answer}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Домашнее задание не прикреплено</p>
        )}

        <h3>Составить домашнее задание</h3>
        <div className="assignment-select-grid">
          {allAssignments.map((a) => (
            <div key={a.id} className="assignment-card">
              <input
                type="checkbox"
                checked={selectedAssignmentIds.includes(a.id)}
                onChange={() => toggleAssignment(a.id)}
              />
              <strong>{a.question}</strong>
              {a.image && (
                <img src={`http://127.0.0.1:8000/media/${a.image}`} alt="assignment" />
              )}
              <p>{a.answer}</p>
            </div>
          ))}
        </div>
        <div className="centered-button">
          <button onClick={submitHomework}>Сохранить домашнее задание</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LessonDetail;
