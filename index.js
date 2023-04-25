// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require('cors');
const path = require('path');

app.use(cors());
app.use(express.json());

const users = [];

app.post('/login', (req, res) => {
  const { name } = req.body;
  if (name) {
    users.push(name);
    return res.json({ message: `Welcome ${name}!` });
  } else {
    return res.status(400).json({ message: 'Name is required.' });
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('message', (data) => {
    console.log(`Message from ${data.name}: ${data.message}`);
    io.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// App.js
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:5000');

function App() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const messageEl = useRef(null);

  useEffect(() => {
    socket.on('message', (data) => {
      setChat([...chat, data]);
    });
  });

  const handleLogin = () => {
    socket.emit('login', { name });
  };

  const handleMessage = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit('message', { name, message });
    setMessage('');
  };

  useEffect(() => {
    messageEl.current.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  return (
    <div>
      <h1>Classroom</h1>
      {name ? (
        <div>
          <h2>Welcome, {name}!</h2>
          <div>
            <form onSubmit={handleSubmit}>
              <input type="text" value={message} onChange={handleMessage} />
              <button type="submit">Send</button>
            </form>
            <div>
              {chat.map((item, index) => (
                <div key={index}>
                  <b>{item.name}:</b> {item.message}
                </div>
              ))}
              <div ref={messageEl}></div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
}

export default App;
