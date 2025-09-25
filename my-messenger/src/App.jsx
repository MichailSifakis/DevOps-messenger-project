import React, { useState } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';

function App() {
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    // Hash the password
    const hashedPassword = CryptoJS.SHA256(password).toString();

    // API call to the backend
    //! Change it to different file!
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gmail, password: hashedPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Login successful!');
        console.log(data); 
      } else {
        alert('Login failed!');
        console.error(data); 
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while logging in.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">WhatsApp Login</h1>
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
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
}

export default App;