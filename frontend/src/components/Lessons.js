import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import './Lessons.css';

const AddLesson = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:8000/accounts/api/add_lesson/', {
        title,
        description,
      });

      if (response.data.status === 'success') {
        alert('Урок успешно добавлен');
      }
    } catch (error) {
      alert('Ошибка при добавлении урока');
      console.error(error);
    }
  };

  return (
    <div>
      <Navbar />
      <main>
      <div className="add-lesson-container">
        <h2>Добавить урок</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit">Добавить урок</button>
        </form>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddLesson;
