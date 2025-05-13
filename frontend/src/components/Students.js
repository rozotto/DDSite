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
                    setStudents(data.students); // Предполагается, что isSelected уже есть
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

            setStudents((prevStudents) =>
                prevStudents.map((student) =>
                    student.id === studentId ? { ...student, isSelected } : student
                )
            );
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
                    <ul className="students-list">
                        {students.map((student) => (
                            <li key={student.id} className="student-item">
                                <strong>{student.username}</strong> — {student.email}
                                <button
                                    onClick={() =>
                                        handleStudentSelection(student.id, !student.isSelected)
                                    }
                                    style={{ marginLeft: '10px' }}
                                    disabled={student.isSelected}
                                >
                                    {student.isSelected ? 'УЖЕ ВЫБРАН' : 'ВЫБРАТЬ УЧЕНИКА'}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Ученики не найдены.</p>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Students;
