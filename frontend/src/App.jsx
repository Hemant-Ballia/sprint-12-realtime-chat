import { useEffect, useState, useRef } from 'react';
import { socket } from './socket';
import './App.css';

const ALLOWED_ROOMS = ['General', 'Tech Support'];

function App() {
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [room, setRoom] = useState('');
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [typingUsers, setTypingUsers] = useState(new Set());
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isJoined) return;

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
      setTypingUsers(new Set());
    }

    function onConnectError(err) {
      setErrorMsg(err.message || 'Connection failed');
      setIsJoined(false);
      setRoom('');
      socket.disconnect();
    }

    function onMessageNew(message) {
      setMessages((prev) => [...prev, message]);
    }

    function onTypingStart({ username: typingUser }) {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.add(typingUser);
        return next;
      });
    }

    function onTypingStop({ username: typingUser }) {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(typingUser);
        return next;
      });
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('message:new', onMessageNew);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);

    socket.auth = { username };
    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('message:new', onMessageNew);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
      socket.disconnect();
    };
  }, [isJoined, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleJoin = (e) => {
    e.preventDefault();
    const name = username.trim();
    if (name.length === 0) {
      setErrorMsg('Username cannot be empty.');
      return;
    }
    if (name.length > 20) {
      setErrorMsg('Username cannot exceed 20 characters.');
      return;
    }
    setErrorMsg('');
    setIsJoined(true);
  };
  
  const handleJoinRoom = (selectedRoom) => {
    if (!isConnected) {
      setErrorMsg('Not connected to server.');
      return;
    }
    
    setIsJoiningRoom(true);
    setErrorMsg('');
    
    socket.emit('room:join', selectedRoom, (response) => {
      setIsJoiningRoom(false);
      if (response && response.error) {
        setErrorMsg(response.error);
      } else {
        setRoom(selectedRoom);
        setMessages([]);
        setTypingUsers(new Set());
      }
    });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!room) return;
    
    const text = inputValue.trim();
    if (text.length === 0) {
      setErrorMsg('Message cannot be empty.');
      return;
    }
    if (text.length > 1000) {
      setErrorMsg('Message cannot exceed 1000 characters.');
      return;
    }
    
    setErrorMsg('');
    socket.emit('message:send', text);
    setInputValue('');
    
    socket.emit('typing:stop');
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    
    if (room) {
      socket.emit('typing:start');
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop');
        typingTimeoutRef.current = null;
      }, 2000);
    }
  };

  if (!isJoined) {
    return (
      <div className="login-container">
        <form className="login-form" onSubmit={handleJoin}>
          <h1>Join Chat</h1>
          {errorMsg && <div className="validation-error">{errorMsg}</div>}
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <button type="submit">Join</button>
        </form>
      </div>
    );
  }
  
  if (!room) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h1>Select Room</h1>
          {errorMsg && <div className="validation-error">{errorMsg}</div>}
          <p className="username-display" style={{textAlign: 'center', marginBottom: '1rem'}}>
            Logged in as <strong>{username}</strong>
          </p>
          <div className="room-buttons">
            {ALLOWED_ROOMS.map(r => (
              <button 
                key={r} 
                onClick={() => handleJoinRoom(r)}
                disabled={isJoiningRoom || !isConnected}
              >
                Join {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const typingArray = Array.from(typingUsers);
  let typingText = '';
  if (typingArray.length === 1) {
    typingText = `${typingArray[0]} is typing...`;
  } else if (typingArray.length === 2) {
    typingText = `${typingArray[0]} and ${typingArray[1]} are typing...`;
  } else if (typingArray.length > 2) {
    typingText = 'Multiple people are typing...';
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div>
          <h1>Realtime Chat - {room}</h1>
          <div className="username-display">Logged in as <strong>{username}</strong></div>
        </div>
        <div className="header-actions">
          <select 
            value={room} 
            onChange={(e) => handleJoinRoom(e.target.value)}
            disabled={isJoiningRoom || !isConnected}
            className="room-select"
          >
            {ALLOWED_ROOMS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <div className="status-indicator">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </header>
      
      <main className="chat-main">
        {messages.length === 0 ? (
          <div className="empty-state">No messages yet in {room}. Start the conversation!</div>
        ) : (
          <div className="message-list">
            {messages.map((msg, index) => (
              <div key={index} className={`message-item ${msg.username === username ? 'message-self' : ''}`}>
                <div className="message-header">
                  <span className="message-username">{msg.username}</span>
                  <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="message-text">{msg.text}</div>
              </div>
            ))}
            
            {typingText && (
              <div className="typing-indicator">{typingText}</div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <footer className="chat-footer">
        {errorMsg && <div className="validation-error">{errorMsg}</div>}
        <form className="chat-input-form" onSubmit={handleSend}>
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${room}...`}
            disabled={!isConnected || isJoiningRoom}
            rows={2}
          />
          <button type="submit" disabled={!isConnected || isJoiningRoom || inputValue.trim() === ''}>
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}

export default App;
