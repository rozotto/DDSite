import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/accounts/api/courses/users')
      .then((response) => {

        const sortedData = response.data.user_courses_count.sort(
          (a, b) => b.course_count - a.course_count
        );
        setLeaderboardData(sortedData);
      })
      .catch((error) => console.error('Error fetching leaderboard data:', error));
  }, []);

  return (
    <div className="leaderboard">
      <Navbar />
      <h1>Лидерборд</h1>
      <table>
        <thead>
          <tr>
            <th>Место</th>
            <th>Пользователь</th>
            <th>Количество очков</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((user, index) => (
            <tr key={user.user_id}>
              <td>{index + 1}</td>
              <td>{user.username}</td>
              <td>{user.course_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Footer />
    </div>
  );
};

export default Leaderboard;
