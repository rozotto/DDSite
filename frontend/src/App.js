import React, { useState } from 'react';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';

function App() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <Router>
      <div className="App">
        <h1>{isLogin ? 'Login' : 'Register'}</h1>

        {isLogin ? <Login /> : <Register />}

        <button onClick={() => setIsLogin(!isLogin)}>
          Switch to {isLogin ? 'Register' : 'Login'}
        </button>

      </div>
    </Router>
  );
}

export default App;
