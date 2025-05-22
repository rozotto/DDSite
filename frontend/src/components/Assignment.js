import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import './Assignment.css';

const AssignmentsPage = () => {
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newAssignment, setNewAssignment] = useState({
    question: '',
    answer: '',
    solution: '',
    image: null
  });
  const [expandedSolutions, setExpandedSolutions] = useState({});

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (activeSection) {
      fetchAssignments(activeSection);
    }
  }, [activeSection]);

  const fetchSections = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/accounts/api/assignment_sections/');
      if (response.data.status === 'success') {
        setSections(response.data.sections);
        if (response.data.sections.length > 0 && !activeSection) {
          setActiveSection(response.data.sections[0].id);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке разделов:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (sectionId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/accounts/api/section_assignments/${sectionId}/`);

      if (response.data.status === 'success') {
        const processedAssignments = response.data.assignments.map(assignment => ({
          ...assignment,
          imageUrl: assignment.image
            ? `http://127.0.0.1:8000${assignment.image}`
            : null
        }));
        setAssignments(processedAssignments);
      }
    } catch (error) {
      console.error('Ошибка при загрузке заданий:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return;

    try {
      const response = await axios.post('http://127.0.0.1:8000/accounts/api/assignment_sections/', {
        title: newSectionTitle
      });

      if (response.data.status === 'success') {
        fetchSections();
        setNewSectionTitle('');
        setShowAddSection(false);
      }
    } catch (error) {
      console.error('Ошибка при добавлении раздела:', error);
    }
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();

    if (!newAssignment.question.trim() || !newAssignment.answer.trim()) {
      return;
    }

    const formData = new FormData();
    formData.append('question', newAssignment.question);
    formData.append('answer', newAssignment.answer);
    formData.append('solution', newAssignment.solution || '');
    if (newAssignment.image) {
      formData.append('image', newAssignment.image);
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `http://127.0.0.1:8000/accounts/api/section_assignments/${activeSection}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.status === 'success') {
        // После успешного добавления обновляем список
        await fetchAssignments(activeSection);

        // Сбрасываем форму
        setNewAssignment({
          question: '',
          answer: '',
          solution: '',
          image: null
        });

        setShowAddAssignment(false);
      }
    } catch (error) {
      console.error('Ошибка при добавлении задания:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSolution = (assignmentId) => {
    setExpandedSolutions(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }));
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="assignments-container">
      <Navbar />

      <div className="assignments-header">
        <h1>Система заданий</h1>
      </div>

      <div className="assignments-layout">
        {/* Боковая панель с разделами */}
        <div className="sections-sidebar">
          <div className="sections-list">
            {sections.map(section => (
              <div
                key={section.id}
                className={`section-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.title}
              </div>
            ))}
          </div>

          <button
            className="add-section-btn"
            onClick={() => setShowAddSection(!showAddSection)}
          >
            {showAddSection ? 'Отменить' : '+ Добавить раздел'}
          </button>

          {showAddSection && (
            <div className="add-section-form">
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="Название раздела"
              />
              <button onClick={handleAddSection}>Сохранить</button>
            </div>
          )}
        </div>

        {/* Основное содержимое с заданиями */}
        <div className="assignments-content">
          {activeSection && (
            <>
              <div className="assignments-header">
                <h2>
                  {sections.find(s => s.id === activeSection)?.title || 'Задания'}
                </h2>
                <button
                  className="add-assignment-btn"
                  onClick={() => setShowAddAssignment(!showAddAssignment)}
                >
                  {showAddAssignment ? 'Отменить' : '+ Добавить задание'}
                </button>
              </div>

              {showAddAssignment && (
                <form className="add-assignment-form" onSubmit={handleAddAssignment}>
                  <div className="form-group">
                    <label>Вопрос:</label>
                    <textarea
                      type="text"
                      value={newAssignment.question}
                      onChange={(e) => setNewAssignment({ ...newAssignment, question: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Ответ:</label>
                    <textarea
                      value={newAssignment.answer}
                      onChange={(e) => setNewAssignment({ ...newAssignment, answer: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Решение:</label>
                    <textarea
                      value={newAssignment.solution}
                      onChange={(e) => setNewAssignment({ ...newAssignment, solution: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Изображение:</label>
                    <input
                      type="file"
                      onChange={(e) => setNewAssignment({ ...newAssignment, image: e.target.files[0] })}
                      accept="image/*"
                    />
                  </div>

                  <button type="submit">Сохранить задание</button>
                </form>
              )}

              <div className="assignments-list">
                {assignments.length === 0 ? (
                  <p>В этом разделе пока нет заданий</p>
                ) : (
                  assignments.map(assignment => (
                    <div key={assignment.id} className="assignment-card">
                      <div className="assignment-id">ID: {assignment.id}</div>
                      <h3 className="assignment-question">{assignment.question}</h3>

                      {assignment.imageUrl && (
                        <div className="assignment-image">
                          <img
                            src={assignment.imageUrl}
                            alt={`Иллюстрация к заданию: ${assignment.question}`}
                            onError={(e) => {
                              e.target.style.display = 'none'; // Скрываем если изображение не загрузилось
                            }}
                          />
                        </div>
                      )}

                      <div className="assignment-answer">
                        <strong>Ответ:</strong> {assignment.answer}
                      </div>

                      {assignment.solution && (
                        <div className="assignment-solution">
                          <button
                            className="solution-toggle"
                            onClick={() => toggleSolution(assignment.id)}
                          >
                            {expandedSolutions[assignment.id] ? 'Скрыть решение' : 'Показать решение'}
                          </button>

                          {expandedSolutions[assignment.id] && (
                            <div className="solution-content">
                              <strong>Решение:</strong> {assignment.solution}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AssignmentsPage;