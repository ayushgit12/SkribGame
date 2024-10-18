import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const Canvas = ({ currentColor, isEraserActive }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Setup the canvas and context when component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 500;
    canvas.height = 500;

    // Set the canvas size for drawing
    const context = canvas.getContext('2d');
    context.lineCap = 'round'; // Set the shape of the brush tip
    context.lineWidth = 5; // Brush thickness
    contextRef.current = context;
  }, []);

  // Start drawing when the mouse is pressed
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  // Draw lines when the mouse moves
  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.strokeStyle = isEraserActive ? 'blue' : currentColor; // Use blue for eraser effect
    contextRef.current.stroke();
  };

  // Stop drawing when the mouse is released
  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  // Save the canvas drawing as a Data URL
  const submitDrawing = async () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    console.log(dataUrl);

    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', {
        dataUrl,
      });
      console.log(response.data);
    } catch (error) {
      console.error('There was an error!', error);
    }
  };

  // Clear the canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  };

  return (
    <div style={styles.container}>
      <canvas
        ref={canvasRef}
        width="500"
        height="500"
        style={styles.canvas}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing} // Stop drawing if the user leaves the canvas area
      />
      <div style={styles.buttonContainer}>
        <button onClick={submitDrawing} style={styles.button}>
          Submit Drawing
        </button>
        <button onClick={clearCanvas} style={styles.button}>
          Clear Canvas
        </button>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  canvas: {
    border: '1px solid white',
    backgroundColor: 'blue',
  },
  buttonContainer: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    padding: '10px 15px',
    margin: '0 5px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default Canvas;
