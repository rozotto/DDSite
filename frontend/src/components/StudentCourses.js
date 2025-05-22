import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import './StudentCourses.css';

// Компонент списка курсов для ученика
const StudentCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/accounts/api/courses/');
                setCourses(response.data?.courses || []);
            } catch (err) {
                setError('Ошибка загрузки курсов');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) return <div className="loading">Загрузка курсов...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="student-courses-page">
            <Navbar />
            <div className="courses-container">
                <h1>Доступные курсы</h1>
                <div className="courses-grid">
                    {courses.map(course => (
                        <div key={course.id} className="course-card">
                            {course.cover_image && (
                                <img
                                    src={course.cover_image}
                                    alt={course.title}
                                    className="course-cover"
                                />
                            )}
                            <div className="course-content">
                                <h2>{course.title}</h2>
                                <p className="course-description">{course.description}</p>
                                <Link to={`/my_courses/${course.id}`} className="view-course-btn">
                                    Перейти к курсу
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
};

// Компонент деталей курса (список уроков)
const StudentCourseDetail = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState({ course: true, lessons: true });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const courseRes = await axios.get(`http://127.0.0.1:8000/accounts/api/courses/${courseId}/`);

                if (courseRes.data?.status === 'success') {
                    setCourse({
                        id: courseRes.data.course.id,
                        title: courseRes.data.course.title,
                        description: courseRes.data.course.description,
                        cover_image: courseRes.data.course.cover_image
                    });

                    setLessons(courseRes.data.course.lessons || []);
                } else {
                    setError('Ошибка загрузки данных курса');
                }
            } catch (err) {
                setError('Ошибка загрузки данных курса');
                console.error(err);
            } finally {
                setLoading({ course: false, lessons: false });
            }
        };

        fetchCourseData();
    }, [courseId]);

    if (loading.course || loading.lessons) return <div className="loading">Загрузка данных курса...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!course) return <div className="no-data">Курс не найден</div>;

    return (
        <div className="student-course-page">
            <Navbar />
            <div className="course-container">
                <button onClick={() => navigate('/my_courses')} className="back-btn">
                    ← Назад к курсам
                </button>

                <div className="course-header">
                    {course.cover_image && (
                        <img src={course.cover_image} alt={course.title} className="course-cover" />
                    )}
                    <div className="course-info">
                        <h1>{course.title}</h1>
                        <p className="course-description">{course.description}</p>
                    </div>
                </div>

                <div className="lessons-section">
                    <h2>Уроки курса</h2>

                    {lessons.length > 0 ? (
                        <div className="lessons-list">
                            {lessons.map(lesson => (
                                <div key={lesson.id} className="lesson-card">
                                    <div className="lesson-info">
                                        <h3>{lesson.lesson__title}</h3>
                                        <Link
                                            to={`/my_courses/${courseId}/lessons/${lesson.lesson__id}`}
                                            className="view-lesson-btn"
                                        >
                                            Перейти к уроку
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-lessons">В этом курсе пока нет уроков</p>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

// Компонент деталей урока для ученика
const StudentLessonDetail = () => {
    const { courseId, lessonId } = useParams();
    const [data, setData] = useState({
        lesson: null,
        files: [],
        sections: [],
        attachedAssignments: []
    });
    const [loading, setLoading] = useState({
        lesson: true,
        sections: true
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/accounts/api/assignment_sections/');

                if (response.data.status === 'success' && Array.isArray(response.data.sections)) {
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

    if (loading.lesson || loading.sections) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Загрузка данных...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={() => window.location.reload()}>Попробовать снова</button>
            </div>
        );
    }

    if (!data.lesson) {
        return <p className="no-data">Данные урока не найдены</p>;
    }

    return (
        <div className="student-lesson-page">
            <Navbar />
            <div className="lesson-content">
                <button
                    onClick={() => navigate(`/my_courses/${courseId}`)}
                    className="back-button"
                >
                    ← Назад к урокам
                </button>

                <h1>{data.lesson.title}</h1>
                <div className="lesson-description" dangerouslySetInnerHTML={{ __html: data.lesson.description }} />

                {/* Видео материалы */}
                {data.files.some(file => file.filename.toLowerCase().match(/\.(mp4|webm|ogg)$/)) && (
                    <div className="video-section">
                        <h2>Видеоурок</h2>
                        <div className="video-container">
                            {data.files
                                .filter(file => file.filename.toLowerCase().match(/\.(mp4|webm|ogg)$/))
                                .map((file, index) => (
                                    <video
                                        key={index}
                                        controls
                                        className="lesson-video"
                                    >
                                        <source src={file.url} type={`video/${file.filename.split('.').pop()}`} />
                                        Ваш браузер не поддерживает видео.
                                    </video>
                                ))}
                        </div>
                    </div>
                )}

                {/* Файлы материалов */}
                {data.files.some(file => !file.filename.toLowerCase().match(/\.(mp4|webm|ogg)$/)) && (
                    <div className="materials-section">
                        <h2>Материалы урока</h2>
                        <div className="files-list">
                            {data.files
                                .filter(file => !file.filename.toLowerCase().match(/\.(mp4|webm|ogg)$/))
                                .map((file, index) => (
                                    <div key={index} className="file-item">
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="file-link"
                                        >
                                            📄 {file.filename}
                                        </a>
                                        <span className="file-size">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Домашние задания */}
                <div className="assignments-section">
                    <h2>Домашнее задание</h2>
                    {data.attachedAssignments.length > 0 ? (
                        <div className="attached-assignments">
                            <div>
                                <strong>Дедлайн:</strong> 29.05.2025
                            </div>
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


export { StudentCourses, StudentCourseDetail, StudentLessonDetail };