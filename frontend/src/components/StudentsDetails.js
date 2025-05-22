import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import './LessonDetail.css';

const LessonDetail = () => {
  const { lessonId } = useParams();
  const [data, setData] = useState({
    lesson: null,
    files: [],
    sections: [],
    attachedAssignments: []
  });
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState({
    lesson: true,
    sections: true,
    file: false,
    homework: false
  });
  const [error, setError] = useState('');

  // Загрузка данных урока и прикрепленных заданий
  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/accounts/api/lessons/${lessonId}/`);

        setData(prev => ({
          ...prev,
          lesson: {
            title: response.data.lesson_title,
            description: response.data.lesson_description
          },
          files: response.data.materials || [],
          attachedAssignments: response.data.attached_assignments || []
        }));
      } catch (err) {
        setError('Не удалось загрузить данные урока');
        console.error('Ошибка загрузки урока:', err);
      } finally {
        setLoading(prev => ({ ...prev, lesson: false }));
      }
    };

    fetchLessonData();
  }, [lessonId]);

  // Загрузка разделов с заданиями
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/accounts/api/assignment_sections/');

        // Проверяем структуру ответа
        if (response.data.status === 'success' && Array.isArray(response.data.sections)) {
          // Для каждого раздела загружаем задания
          const sectionsWithAssignments = await Promise.all(
            response.data.sections.map(async section => {
              try {
                const assignmentsRes = await axios.get(
                  `http://127.0.0.1:8000/accounts/api/section_assignments/${section.id}/`
                );

                return {
                  ...section,
                  assignments: assignmentsRes.data.status === 'success'
                    ? assignmentsRes.data.assignments
                    : []
                };
              } catch (err) {
                console.error(`Ошибка загрузки заданий для раздела ${section.id}:`, err);
                return { ...section, assignments: [] };
              }
            })
          );

          setData(prev => ({ ...prev, sections: sectionsWithAssignments }));
        } else {
          throw new Error('Неверный формат данных разделов');
        }
      } catch (err) {
        setError('Не удалось загрузить разделы с заданиями');
        console.error('Ошибка загрузки разделов:', err);
      } finally {
        setLoading(prev => ({ ...prev, sections: false }));
      }
    };

    fetchSections();
  }, []);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const toggleAssignmentSelection = (assignment) => {
    setSelectedAssignments(prev => {
      const isAttached = data.attachedAssignments.some(a => a.id === assignment.id);
      if (isAttached) return prev;

      const isSelected = prev.some(a => a.id === assignment.id);
      return isSelected
        ? prev.filter(a => a.id !== assignment.id)
        : [...prev, assignment];
    });
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      setLoading(prev => ({ ...prev, file: true }));
      setError('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `http://127.0.0.1:8000/accounts/api/lessons/${lessonId}/upload_files/`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.status === 'success') {
        setData(prev => ({
          ...prev,
          files: [...prev.files, response.data.file]
        }));
        setFile(null);
        e.target.reset();
      }
    } catch (err) {
      setError('Ошибка при загрузке файла');
      console.error('Ошибка загрузки файла:', err);
    } finally {
      setLoading(prev => ({ ...prev, file: false }));
    }
  };

  const submitHomework = async () => {
    try {
      setLoading(prev => ({ ...prev, homework: true }));
      setError('');

      const response = await axios.post(
        `http://127.0.0.1:8000/accounts/api/lessons/${lessonId}/homework/`,
        { assignment_ids: selectedAssignments.map(a => a.id) }
      );

      if (response.data.status === 'success') {
        // Обновляем данные после успешного сохранения
        const lessonResponse = await axios.get(`http://127.0.0.1:8000/accounts/api/lessons/${lessonId}/`);
        setData(prev => ({
          ...prev,
          attachedAssignments: lessonResponse.data.attached_assignments || []
        }));
        setSelectedAssignments([]);
      }
    } catch (err) {
      setError('Ошибка при сохранении заданий');
      console.error('Ошибка сохранения заданий:', err);
    } finally {
      setLoading(prev => ({ ...prev, homework: false }));
    }
  };

  const removeAssignment = async (assignmentId) => {
    try {
      setLoading(prev => ({ ...prev, homework: true }));
      setError('');

      const response = await axios.delete(
        `http://127.0.0.1:8000/accounts/api/lessons/${lessonId}/homework/?assignment_id=${assignmentId}`
      );

      if (response.data.status === 'success') {
        // Обновляем данные после успешного удаления
        const lessonResponse = await axios.get(`http://127.0.0.1:8000/accounts/api/lessons/${lessonId}/`);
        setData(prev => ({
          ...prev,
          attachedAssignments: lessonResponse.data.attached_assignments || []
        }));
      }
    } catch (err) {
      setError('Ошибка при удалении задания');
      console.error('Ошибка удаления задания:', err);
    } finally {
      setLoading(prev => ({ ...prev, homework: false }));
    }
  };

  // Проверяем, загружаются ли основные данные
  if (loading.lesson || loading.sections) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  // Проверяем наличие ошибок
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()}>Попробовать снова</button>
      </div>
    );
  }

  // Проверяем, загрузился ли урок
  if (!data.lesson) {
    return <p className="no-data">Данные урока не найдены</p>;
  }

  return (
    <div className="lesson-page">
      <Navbar />
      <div className="lesson-content">
        <h1>{data.lesson.title}</h1>
        <div className="lesson-description">{data.lesson.description}</div>

        {/* Секция материалов */}
        <div className="section materials-section">
          <h2>Материалы урока</h2>

          {data.files.some(file => file.filename.toLowerCase().match(/\.(mp4|webm|ogg)$/)) && (
            <div className="video-lesson">
              <h3>Видеоурок</h3>
              {data.files
                .filter(file => file.filename.toLowerCase().match(/\.(mp4|webm|ogg)$/))
                .map((file, index) => (
                  <div key={index} className="video-container">
                    <div className="video-wrapper">
                      <video controls style={{ maxWidth: '600px', borderRadius: '8px', width: '100%' }}>
                        <source src={file.url} />
                        Ваш браузер не поддерживает встроенное видео.
                      </video>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Остальные материалы */}
          {data.files.some(file => !file.filename.toLowerCase().match(/\.(mp4|webm|ogg)$/)) && (
            <div className="lesson-materials">
              <h3>Конспект</h3>
              {data.files
                .filter(file => !file.filename.toLowerCase().match(/\.(mp4|webm|ogg)$/))
                .map((file, index) => (
                  <div key={index} className="file-item">
                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                      {file.filename}
                    </a>
                    <span className="file-size">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Секция прикрепленных заданий */}
        <div className="section assignments-section">
          <h2>Домашнее задание</h2>
          {data.attachedAssignments.length > 0 ? (
            <div className="attached-assignments">
              {data.attachedAssignments.map(assignment => (
                <div key={assignment.id} className="assignment-card">
                  <div className="assignment-header">
                    <h3>{assignment.question}</h3>

                  </div>
                  {assignment.image && (
                    <img
                      src={assignment.image}
                      alt="Иллюстрация задания"
                      className="assignment-image"
                    />
                  )}
                  <div className="assignment-answer">
                    <strong>Ответ:</strong> {assignment.answer}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-assignments">Нет прикрепленных заданий</p>
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default LessonDetail;