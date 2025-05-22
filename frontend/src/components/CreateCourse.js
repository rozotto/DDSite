import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Navbar from './Navbar';
import Footer from './Footer';
import './CreateCourse.css';

const CourseCreator = () => {
    const [courses, setCourses] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [newCourse, setNewCourse] = useState({ title: '', description: '' });
    const [loading, setLoading] = useState({ courses: true, lessons: true, operations: false });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(prev => ({ ...prev, courses: true, lessons: true }));
                const [coursesRes, lessonsRes] = await Promise.all([
                    axios.get('http://127.0.0.1:8000/accounts/api/courses/'),
                    axios.get('http://127.0.0.1:8000/accounts/api/complete_lessons/')
                ]);
                setCourses(coursesRes.data?.courses || []);
                setLessons(lessonsRes.data || []);
            } catch (err) {
                setError('Ошибка загрузки данных');
                console.error(err);
            } finally {
                setLoading(prev => ({ ...prev, courses: false, lessons: false }));
            }
        };
        fetchData();
    }, []);

    const fetchCourseDetail = async (id) => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/accounts/api/courses/${id}/`);
            setSelectedCourse(res.data?.course || null);
        } catch (err) {
            setError('Ошибка загрузки курса');
        }
    };

    const handleCreateCourse = async () => {
        try {
            setLoading(prev => ({ ...prev, operations: true }));
            const response = await axios.post(
                'http://127.0.0.1:8000/accounts/api/courses/',
                newCourse,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    }
                }
            );
            if (response.data?.status === 'success') {
                const newId = response.data.course_id;
                const res = await axios.get(`http://127.0.0.1:8000/accounts/api/courses/${newId}/`);
                setCourses(prev => [...prev, res.data.course]);
                setSelectedCourse(res.data.course);
                setNewCourse({ title: '', description: '' });
            }
        } catch (err) {
            setError('Ошибка создания курса');
        } finally {
            setLoading(prev => ({ ...prev, operations: false }));
        }
    };

    const addLessonToCourse = async (lessonId) => {
        if (!selectedCourse) return;
        try {
            setLoading(prev => ({ ...prev, operations: true }));
            await axios.post(
                `http://127.0.0.1:8000/accounts/api/courses/${selectedCourse.id}/lessons/`,
                { lesson_id: lessonId },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    }
                }
            );
            await fetchCourseDetail(selectedCourse.id);
        } catch (err) {
            setError('Ошибка добавления урока');
        } finally {
            setLoading(prev => ({ ...prev, operations: false }));
        }
    };

    const removeLessonFromCourse = async (lessonId) => {
        if (!selectedCourse) return;
        try {
            setLoading(prev => ({ ...prev, operations: true }));
            await axios.delete(
                `http://127.0.0.1:8000/accounts/api/courses/${selectedCourse.id}/lessons/${lessonId}/`,
                { headers: { 'X-CSRFToken': getCookie('csrftoken') } }
            );
            await fetchCourseDetail(selectedCourse.id);
        } catch (err) {
            setError('Ошибка удаления урока');
        } finally {
            setLoading(prev => ({ ...prev, operations: false }));
        }
    };

    const onDragEnd = async (result) => {
        if (!result.destination || !selectedCourse || !selectedCourse.lessons) return;
        const reordered = Array.from(selectedCourse.lessons);
        const [moved] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, moved);
        try {
            setLoading(prev => ({ ...prev, operations: true }));
            await axios.put(
                `http://127.0.0.1:8000/accounts/api/courses/${selectedCourse.id}/`,
                {
                    lessons_order: reordered.map((l, i) => ({
                        lesson_id: l.lesson__id,
                        order: i + 1
                    }))
                },
                { headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') } }
            );
            await fetchCourseDetail(selectedCourse.id);
        } catch (err) {
            setError('Ошибка изменения порядка уроков');
        } finally {
            setLoading(prev => ({ ...prev, operations: false }));
        }
    };

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    if (loading.courses || loading.lessons) return <div className="loading">Загрузка данных...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <>
            <Navbar />
            <div className="course-creator">
                <div className="courses-list">
                    <h2>Мои курсы</h2>
                    <div className="create-course-form">
                        <input
                            type="text"
                            placeholder="Название курса"
                            value={newCourse.title}
                            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                        />
                        <textarea
                            placeholder="Описание курса"
                            value={newCourse.description}
                            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                        />
                        <button
                            onClick={handleCreateCourse}
                            disabled={loading.operations || !newCourse.title}
                        >
                            {loading.operations ? 'Создание...' : 'Создать курс'}
                        </button>
                    </div>

                    <ul>
                        {courses?.map(course => (
                            <li
                                key={course.id}
                                className={selectedCourse?.id === course.id ? 'active' : ''}
                                onClick={() => fetchCourseDetail(course.id)}
                            >
                                {course.title}
                            </li>
                        ))}
                    </ul>
                </div>

                {selectedCourse && (
                    <div className="course-editor">
                        <h2>Редактирование: {selectedCourse.title}</h2>
                        <div className="course-lessons">
                            <h3>Уроки в курсе</h3>
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="lessons">
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} className="lessons-container">
                                            {selectedCourse.lessons.length > 0 ? (
                                                selectedCourse.lessons.map((lesson, index) => (
                                                    <Draggable key={lesson.lesson__id} draggableId={String(lesson.lesson__id)} index={index}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="lesson-item"
                                                            >
                                                                <span>{lesson.lesson__title}</span>
                                                                <button onClick={() => removeLessonFromCourse(lesson.lesson__id)} disabled={loading.operations}>
                                                                    Удалить
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))
                                            ) : (
                                                <p>В курсе пока нет уроков</p>
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>

                        <div className="available-lessons">
                            <h3>Доступные уроки</h3>
                            <ul>
                                {lessons
                                    .filter(l => !selectedCourse.lessons.some(sl => sl.lesson__id === l.id))
                                    .map(l => (
                                        <li key={l.id}>
                                            {l.title}
                                            <button onClick={() => addLessonToCourse(l.id)} disabled={loading.operations}>
                                                Добавить
                                            </button>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default CourseCreator;
