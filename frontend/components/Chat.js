import { useState, useEffect } from 'react';
import socket from '../services/socket';

const Chat = ({ roomId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    console.log(messages)
    socket.on('chat_message', (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      socket.off('chat_message');
    };
   
  }, []);

  const sendMessage = () => {
    socket.emit('chat_message', { roomId, message });
    setMessage('');
  };

  return (
    <div>
      <div style={{color: "black"}}>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
