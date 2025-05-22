import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './Students.css';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const userObj = JSON.parse(storedUser);

        if (!userObj?.is_staff) {
            navigate('/home');
            return;
        }

        const fetchStudents = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/accounts/api/students/?tutor_id=${userObj.id}`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`Ошибка HTTP: ${response.status}`);
                }

                const data = await response.json();

                if (Array.isArray(data.students)) {
                    // Получаем список всех выбранных учеников (любым преподавателем)
                    const selectedStudentsResponse = await fetch('http://127.0.0.1:8000/accounts/api/all_selected_students/', {
                        credentials: 'include',
                    });
                    const selectedStudentsData = await selectedStudentsResponse.json();
                    const selectedStudentIds = selectedStudentsData.selected_students || [];

                    // Обогащаем данные студентов информацией о выборе
                    const enrichedStudents = data.students.map(student => ({
                        ...student,
                        isSelected: student.isSelected,
                        isSelectedByOther: selectedStudentIds.includes(student.id) && !student.isSelected
                    }));

                    setStudents(enrichedStudents);
                } else {
                    throw new Error('Неверный формат данных от сервера');
                }
            } catch (err) {
                setError('Не удалось загрузить список учеников.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [navigate]);

    const handleStudentSelection = async (studentId, isSelected) => {
        try {
            const storedUser = localStorage.getItem('user');
            const userObj = JSON.parse(storedUser);

            // Проверяем, не выбран ли ученик другим админом
            const student = students.find(s => s.id === studentId);
            if (isSelected && student.isSelectedByOther) {
                setError('Этот ученик уже выбран другим преподавателем.');
                return;
            }

            const response = await fetch('http://127.0.0.1:8000/accounts/api/assign_student/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    student_id: studentId,
                    tutor_id: userObj.id,
                    is_selected: isSelected,
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении ученика');
            }

            // После успешного обновления, обновляем список студентов
            const updatedStudents = students.map(student => {
                if (student.id === studentId) {
                    return {
                        ...student,
                        isSelected: isSelected,
                        isSelectedByOther: false
                    };
                }
                return student;
            });

            setStudents(updatedStudents);
            setError('');
        } catch (err) {
            setError('Не удалось закрепить ученика.');
            console.error(err);
        }
    };

    return (
        <div className="students-container">
            <Navbar />
            <main>
                <h2>Список учеников</h2>
                {loading ? (
                    <p>Загрузка...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : students.length > 0 ? (
                    <>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <ul className="students-list">
                            {students.map((student) => (
                                <li key={student.id} className="student-item">
                                    <div className="student-info">
                                        <span>{student.email}</span>
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleStudentSelection(student.id, !student.isSelected)
                                        }
                                        className={`selection-button ${student.isSelected
                                            ? 'selected'
                                            : student.isSelectedByOther
                                                ? 'selected-by-other'
                                                : ''
                                            }`}
                                        disabled={student.isSelectedByOther}
                                    >
                                        {student.isSelected
                                            ? 'ВЫБРАН ВАМИ'
                                            : student.isSelectedByOther
                                                ? 'ВЫБРАН ДРУГИМ'
                                                : 'ВЫБРАТЬ УЧЕНИКА'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p>Ученики не найдены.</p>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Students;