import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const CourseQuiz = () => {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || !userData.id) {
      alert('Вы не авторизованы. Пожалуйста, войдите в систему.');
      return;
    }
    setUserId(userData.id);
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetch(`http://127.0.0.1:8000/accounts/api/courses/${id}/questions/`)
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions))
      .catch((error) => {
        console.error('Ошибка при загрузке вопросов:', error);
        alert('Ошибка при загрузке вопросов');
      });
  }, [id, userId]);

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleSubmit = async () => {
    const response = await fetch(`http://127.0.0.1:8000/accounts/api/courses/${id}/check-answers/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        answers: answers,
      }),
    });

    const data = await response.json();

    if (data.error) {
      alert(`Ошибка: ${data.error}`);
    } else {
      setScore(data.score);
      alert(`Ваш результат: ${data.correct}/${data.total} (${data.score})`);
    }
  };

  return (
    <div>
      <h2>Пройти тест</h2>
      {questions.map((question) => (
        <div key={question.id}>
          <p>{question.text}</p>
          {question.options.map((option) => (
            <label key={option.id}>
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                onChange={() => handleAnswerChange(question.id, option.id)}
              />
              {option.text}
            </label>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit}>Отправить ответы</button>
    </div>
  );
};

export default CourseQuiz;

