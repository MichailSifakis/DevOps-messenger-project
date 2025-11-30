// App.jsx - Main client app
// - Handles auth (signup/login), JWT storage, and session restore
// - Manages contacts, conversations, and real-time messages
// - Connects to Socket.IO and REST endpoints
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import CryptoJS from 'crypto-js';
import { io } from 'socket.io-client';

function App() {
  // Auth and session state
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Messaging state
  const [toCode, setToCode] = useState('');
  const [thread, setThread] = useState([]);
  const [draft, setDraft] = useState('');
  const socketRef = useRef(null);
  const [conversations, setConversations] = useState([]); // recent chats (code + last text)
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState([]); // saved peers by code
  const [newContactCode, setNewContactCode] = useState('');

  // On load, restore user + token from localStorage (no server call)
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser && !user) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      }
    } else if (!storedToken && !storedUser) {
      // Clear state if no data in localStorage
      setUser(null);
      setToken(null);
    }
  }, []);

  // Sync token state if localStorage changes in another tab
  useEffect(() => {
    const handleStorageChange = () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken && token) {
        setToken(null);
        setUser(null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [token]);

  // Signup/Login submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const hashedPassword = CryptoJS.SHA256(password).toString();

    const endpoint = mode === 'signup'
      ? '/api/users/signup'
      : '/api/users/login';

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
        const userData = { gmail: data.gmail, code: data.code, id: data.id };
        setUser(userData);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        alert(data?.message || (mode === 'signup' ? 'Sign up failed!' : 'Login failed!'));
        console.error(data);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred.');
    }
  };

  // Socket setup: join my code room and append incoming messages
  useEffect(() => {
    if (!user || !user.code) return;
    const socket = io('http://messenger-backend-ms-17326.northeurope.azurecontainer.io:5000', {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;
    socket.emit('join', user.code);
    const onMessage = (msg) => {
      if ((msg.fromCode === toCode && msg.toCode === user.code) || (msg.fromCode === user.code && msg.toCode === toCode)) {
        setThread(prev => [...prev, msg]);
      }
      if (msg.fromCode === user.code || msg.toCode === user.code) {
        refreshConversations();
      }
    };
    socket.on('message', onMessage);
    refreshConversations();
    return () => {
      socket.off('message', onMessage);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user && user.code, toCode]);

  // Load full message thread with selected peer
  const refreshThread = async (peerCode) => {
    if (!peerCode || !token) return;
    try {
      const res = await fetch(`/api/messages/thread?a=${user.code}&b=${peerCode}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        // Token expired, logout
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }
      const data = await res.json();
      setThread(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  // Load recent conversations for the sidebar
  const refreshConversations = async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/messages/conversations?code=${user.code}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  // Load saved contacts
  const refreshContacts = async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/contacts?ownerCode=${user.code}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  // Save a new contact by code
  const addContact = async () => {
    const code = (newContactCode || '').trim();
    if (!code) return;
    
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setUser(null);
      setToken(null);
      return;
    }
    
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ ownerCode: user.code, peerCode: code })
      });
      if (res.status === 401) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }
      if (res.ok) {
        setNewContactCode('');
        refreshContacts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Remove a saved contact by code
  const deleteContact = async (peerCode) => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setUser(null);
      setToken(null);
      return;
    }
    
    try {
      const res = await fetch('/api/contacts', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ ownerCode: user.code, peerCode })
      });
      if (res.status === 401) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }
      if (res.ok) {
        refreshContacts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete entire conversation thread (all messages)
  const deleteConversation = async (peerCode) => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setUser(null);
      setToken(null);
      return;
    }
    
    try {
      const res = await fetch(`/api/messages/thread?a=${user.code}&b=${peerCode}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      if (res.status === 401) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }
      
      if (res.ok) {
        // Remove from local state
        setConversations(prev => prev.filter(c => c.peerCode !== peerCode));
        // Clear thread if we're viewing this conversation
        if (toCode === peerCode) {
          setThread([]);
          setToCode('');
        }
        // Refresh conversations to ensure consistency
        refreshConversations();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Send a message to current peer; uses token from localStorage at call time
  const sendMessage = async () => {
    if (!draft.trim() || !toCode) return;
    
    // Check if token still exists in localStorage
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setUser(null);
      setToken(null);
      return;
    }
    
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ fromCode: user.code, toCode, text: draft.trim() }),
      });
      if (res.status === 401) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }
      const msg = await res.json();
      if (res.ok) {
        setDraft('');
        setThread(prev => [...prev, msg]);
        // bump conversation to top
        refreshConversations();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Unified sidebar list: contacts overlaid with conversations (no duplicates)
  const combinedList = useMemo(() => {
    const map = new Map();
    // Seed with contacts
    for (const c of contacts) {
      map.set(c.peerCode, { peerCode: c.peerCode, lastText: 'Contact' });
    }
    // Overlay conversations with latest text
    for (const conv of conversations) {
      map.set(conv.peerCode, { peerCode: conv.peerCode, lastText: conv.lastText });
    }
    return Array.from(map.values());
  }, [contacts, conversations]);

  if (user) {
    return (
      <div className="chat-shell">
        <div className="chat-sidebar">
          <div className="sidebar-header">WhatsApp Clone</div>
          <div className="user-card">
            <div className="avatar">{user.gmail.charAt(0).toUpperCase()}</div>
            <div className="user-meta">
              <div className="user-email">{user.gmail}</div>
              <div className="user-code">Code: {user.code || '—'}</div>
            </div>
          </div>
          <div style={{ padding: '8px 16px', borderBottom: '1px solid #2a2f32' }}>
            <label className="login-label">Add contact by code</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
              <input
                className="add-contact-input"
                placeholder="6-digit code"
                value={newContactCode}
                onChange={(e) => setNewContactCode(e.target.value)}
              />
              <img src="/plus.png" alt="add" className="add-contact" onClick={addContact} />
            </div>
          </div>
          <div className="chats-list">
            {combinedList.map(c => (
              <div
                key={c.peerCode}
                className={`chat-item ${toCode === c.peerCode ? 'active' : ''}`}
                onClick={() => { setToCode(c.peerCode); refreshThread(c.peerCode); }}
              >
                <div className="chat-avatar">{c.peerCode.charAt(0)}</div>
                <div className="chat-info">
                  <div className="chat-title">{c.peerCode}</div>
                  <div className="chat-subtitle">{c.lastText}</div>
                </div>
                <button
                  className="delete-contact"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (contacts.some(k => k.peerCode === c.peerCode)) {
                      deleteContact(c.peerCode);
                    } else {
                      deleteConversation(c.peerCode);
                    }
                  }}
                  aria-label={`Remove ${c.peerCode}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="chat-main">
          <div className="chat-header">
            <div className="chat-title">Chat with: {toCode || '—'} · Me: {user.code || '—'}</div>
            <div className="chat-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {isSearching && (
                <input
                  className="input"
                  placeholder="Search messages"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: 220 }}
                />
              )}
              <button className="action" onClick={() => setIsSearching((v) => !v)}>{isSearching ? 'Close' : 'Search'}</button>
              <button className="action" onClick={() => { setUser(null); setToken(null); localStorage.removeItem('token'); localStorage.removeItem('user'); }}>Logout</button>
            </div>
          </div>
          <div className="chat-messages">
            {(searchQuery ? thread.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase())) : thread).map((m, index) => (
              <div key={m.id || `msg-${index}`} className={`message ${m.fromCode === user.code ? 'outbound' : 'inbound'}`}>
                <div className="bubble">{m.text}</div>
              </div>
            ))}
          </div>
          <form className="chat-input" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <input className="input" placeholder="Type a message" value={draft} onChange={(e) => setDraft(e.target.value)} />
            <button className="send" type="submit">Send</button>
          </form>
        </div>
      </div>
    );
  }

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
          <button
            type="button"
            className="login-button"
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
            style={{ backgroundColor: '#6b7280' }}
          >
            {mode === 'signup' ? 'Have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;