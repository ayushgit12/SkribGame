import React from 'react';

// Styles for the WaitingRoom component
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
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    position: 'relative',
    overflow: 'hidden',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '20px',
    color: '#FFDC00', // Bright yellow for the title
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
  },
  subtitle: {
    fontSize: '2rem',
    marginBottom: '20px',
    color: '#FFDC00', // Bright yellow for the subtitle
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
  },
  userList: {
    listStyleType: 'none',
    padding: 0,
    margin: '20px 0',
    width: '100%',
    textAlign: 'center',
  },
  user: {
    backgroundColor: '#A2D5AB', // Light olive green for user items
    padding: '10px',
    borderRadius: '5px',
    margin: '5px 0',
    transition: 'background-color 0.3s',
    cursor: 'pointer',
  },
  userHover: {
    backgroundColor: '#C1E1C5', // Lighter olive green on hover
  },
  startButton: {
    backgroundColor: '#FFDC00', // Bright yellow button color
    color: 'black',
    padding: '15px 30px',
    marginTop: '20px',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
  },
  startButtonHover: {
    backgroundColor: '#FFC107', // Darker yellow button hover color
  },
};

const WaitingRoom = ({ users, isHost, onStartGame }) => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Waiting Room</h1>
      <h3 style={styles.subtitle}>Connected Users:</h3>
      <ul style={styles.userList}>
        {users.map((user, index) => (
          <li 
            key={index} 
            style={styles.user} 
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.userHover.backgroundColor)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = styles.user.backgroundColor)}
          >
            {user}
          </li>
        ))}
      </ul>
      {isHost && (
        <button
          style={styles.startButton}
          onClick={onStartGame}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.startButtonHover.backgroundColor)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = styles.startButton.backgroundColor)}
        >
          Start Game
        </button>
      )}
    </div>
  );
};

export default WaitingRoom;
