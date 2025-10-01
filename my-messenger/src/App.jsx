import React, { useState } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';

function App() {
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hashedPassword = CryptoJS.SHA256(password).toString();

    const endpoint = mode === 'signup'
      ? 'http://localhost:5000/api/users/signup'
      : 'http://localhost:5000/api/users/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gmail, password: hashedPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(mode === 'signup' ? 'Sign up successful!' : 'Login successful!');
        console.log(data);
      } else {
        alert(data?.message || (mode === 'signup' ? 'Sign up failed!' : 'Login failed!'));
        console.error(data);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">{mode === 'signup' ? 'Sign Up' : 'Sign In'}</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="gmail" className="login-label">Gmail</label>
          <input
            type="email"
            id="gmail"
            className="login-input"
            placeholder="Enter your Gmail"
            value={gmail}
            onChange={(e) => setGmail(e.target.value)}
          />
          <label htmlFor="password" className="login-label">Password</label>
          <input
            type="password"
            id="password"
            className="login-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="login-button">{mode === 'signup' ? 'Create account' : 'Login'}</button>
        </form>
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <button
            type="button"
            className="login-button"
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            style={{ backgroundColor: '#6b7280' }}
          >
            {mode === 'signup' ? 'Have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;