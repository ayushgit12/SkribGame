import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000'); // Change this URL based on your server setup

const Timer = ({ onTimeUp }) => {
  const [time, setTime] = useState(120); // Default to 120 seconds

  useEffect(() => {
    // Listen for timer updates from the server
    socket.on('timerUpdate', (newTime) => {
      setTime(newTime);
    });

    // Listen for time up event
    socket.on('timeUp', () => {
      onTimeUp();
    });

    // Clean up the socket connection on unmount
    return () => {
      socket.off('timerUpdate');
      socket.off('timeUp');
    };
  }, []);

  return <div>{time} seconds remaining</div>;
};

export default Timer;
