import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import './Assignment.css';

const AssignmentPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    question: '',
    answer: '',
    image: null
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/accounts/api/assignments/');

      if (response.data.status === 'success') {
        const processedAssignments = response.data.assignments.map(assignment => ({
          ...assignment,
          imageUrl: assignment.image
            ? `http://127.0.0.1:8000/media/${assignment.image}`
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setNewAssignment(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('question', newAssignment.question);
    formData.append('answer', newAssignment.answer);
    if (newAssignment.image) {
      formData.append('image', newAssignment.image);
    }

    try {
      await axios.post('http://127.0.0.1:8000/accounts/api/assignments/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchAssignments();
      setShowAddForm(false);
      setNewAssignment({
        question: '',
        answer: '',
        image: null
      });
    } catch (error) {
      console.error('Ошибка при добавлении задания:', error);
    }
  };

  if (loading) {
    return <div className="loading-state">Загрузка заданий...</div>;
  }

  return (
    <div className="assignment-page">
      <Navbar />

      <div className="page-header">
            <h1 className="page-title">Задания</h1>
            <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="toggle-form-btn"
            >
                {showAddForm ? 'Отменить' : 'Добавить задание'}
            </button>
      </div>

      {showAddForm && (
        <div className="add-form">
          <h2 className="form-title">Добавить новое задание</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Вопрос:</label>
              <input
                type="text"
                name="question"
                value={newAssignment.question}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Ответ:</label>
              <textarea
                name="answer"
                value={newAssignment.answer}
                onChange={handleInputChange}
                required
                className="form-input form-textarea"
              />
            </div>
            <div className="form-group">
              <label>Изображение:</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
            <button type="submit" className="submit-btn">
              Сохранить
            </button>
          </form>
        </div>
      )}

      <div className="assignments-grid">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="assignment-card">
            <div className="assignment-id">{assignment.id}</div>
            <h3 className="assignment-question">{assignment.question}</h3>

            {assignment.imageUrl && (
              <div className="assignment-image">
                <img
                  src={assignment.imageUrl}
                  alt={`Иллюстрация к заданию: ${assignment.question}`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="assignment-answer">
              <p>{assignment.answer}</p>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default AssignmentPage;