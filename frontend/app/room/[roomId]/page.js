'use client';

import { useEffect, useState } from 'react';
import socket from '../../../services/socket';
import Canvas from '../../../components/Canvas';
import WaitingRoom from '../../../components/WaitingRoom';
import axios from 'axios';

export default function Room({ params }) {
  const [actualImageUrl, setActualImageUrl] = useState('');
  const [description, setDescription] = useState([]);
  const roomId = params.roomId;
  const [users, setUsers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [timer, setTimer] = useState(120);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  // Timer logic
  useEffect(() => {
    let interval;

    if (isGameStarted && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000); // Decrease timer every second

      if (timer === 120) {
        const fetchData = async () => {
          try {
            const response = await axios.post('http://127.0.0.1:5000/generate');
            console.log(response.data);
            setActualImageUrl(response.data.image_base64);
            setDescription(response.data.description);
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
        fetchData(); // Call the async function to handle the axios request
      }
    }

    if (timer === 0) {
      clearInterval(interval); // Stop the timer when it reaches zero
    }

    return () => {
      clearInterval(interval); // Cleanup when component unmounts or when timer reaches 0
    };
  }, [isGameStarted, timer]);

  useEffect(() => {
    socket.on('chat_message', (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      socket.off('chat_message');
    };
  }, []);

  const sendMessage = () => {
    socket.emit('chat_message', { roomId, message });
    setMessage('');
  };

  useEffect(() => {
    socket.emit('join', { roomId, username: localStorage.getItem('username') });
    socket.on('host_info', (data) => {
      setIsHost(data.isHost); // Set isHost based on the backend response
    });

    socket.on('user_list', (userList) => setUsers(userList));

    return () => {
      socket.emit('leave', { roomId, username: localStorage.getItem('username') });
    };
  }, [roomId]);

  const startGame = () => {
    if (isHost) {
      // Emit an event to all users in the room that the game has started
      socket.emit('start_game', { roomId });
  
      // Locally start the game for the host
      setIsGameStarted(true);
    }
  };
  useEffect(() => {
    socket.on('game_started', () => {
      setIsGameStarted(true); // Start the game for all users when this event is received
    });
  
    return () => {
      socket.off('game_started'); // Clean up the listener when component unmounts
    };
  }, []);
  
  
  return (
    <div>
      {!isGameStarted ? (
        <WaitingRoom
          users={users}
          isHost={isHost}
          onStartGame={startGame}
        />
      ) : (
        <div style={styles.container}>
          <h1 style={styles.title}>Game Started! Timer: {timer}s</h1>

          {/* Keywords heading and description displayed horizontally */}
          <div style={styles.descriptionContainer}>
            <h2 style={styles.keywordsTitle}>Keywords</h2>
            <div style={styles.keywordsWrapper}>
              {description.map((desc, index) => (
                <span key={index} style={styles.descriptionText}>
                  {desc}
                </span>
              ))}
            </div>
          </div>

          <div style={styles.gameContainer}>
            <Canvas roomId={roomId} />
            <div style={styles.chatBox}>
              <div style={styles.chatMessages}>
                {messages.map((msg, index) => (
                  <p key={index} style={styles.message}>
                    {msg}
                  </p>
                ))}
              </div>
              <div style={styles.chatInputContainer}>
                <input
                  className='text-black'
                  style={styles.chatInput}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button style={styles.chatButton} onClick={sendMessage}>
                  Send
                </button>
              </div>
              {/* Submit Drawing Button */}
              <button style={styles.submitButton} onClick={() => console.log('Submit Drawing')}>
                Submit Drawing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#3D9970', // Olive green background
    color: '#ffffff', // White text for contrast
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '20px',
    color: '#FFDC00', // Bright yellow for the title
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
  },
  descriptionContainer: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  keywordsTitle: {
    fontSize: '1.5rem',
    marginBottom: '10px',
    color: '#FFDC00', // Bright yellow for the title
  },
  keywordsWrapper: {
    display: 'flex',
    justifyContent: 'center',
    border: '1px solid #FFDC00', // Border color
    padding: '10px',
    borderRadius: '5px',
    backgroundColor: '#A2D5AB', // Light olive green background
  },
  descriptionText: {
    color: '#000000', // Black for the description text
    fontSize: '1rem',
    margin: '0 5px', // Space between words
    padding: '5px 10px',
    border: '1px solid #000000', // Border for each keyword
    borderRadius: '5px',
  },
  gameContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '90%',
    maxWidth: '1200px',
    gap: '20px',
  },
  chatBox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#A2D5AB', // Light olive green for the chat background
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    width: '300px',
    height: '500px',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '10px',
  },
  message: {
    color: '#000000', // Black text
    backgroundColor: '#ffffff', // White background for messages
    padding: '8px',
    borderRadius: '5px',
    marginBottom: '5px',
  },
  chatInputContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  chatInput: {
    flex: 1,
    padding: '10px',
    borderRadius: '5px',
    border: 'none',
    outline: 'none',
    marginRight: '10px',
  },
  chatButton: {
    backgroundColor: '#FFDC00', // Bright yellow button
    color: '#000000', // Black text
    border: 'none',
    borderRadius: '5px',
    padding: '10px 15px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#FF851B', // Orange for the submit button
    color: '#ffffff', // White text
    border: 'none',
    borderRadius: '5px',
    padding: '10px 15px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px', // Space above the button
  },
  card: {
    backgroundColor: '#A2D5AB', // Light olive green for card background
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
    width: '80%', // Set a width for the card
    maxWidth: '800px', // Max width to ensure it doesn't stretch too much
  },
};
