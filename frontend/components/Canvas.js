import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const Canvas = ({ onSave }) => {
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
    context.strokeStyle = 'black'; // Brush color
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
    contextRef.current.stroke();
  };

  // Stop drawing when the mouse is released
  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  // Save the canvas drawing as a Data URL
  const submitDrawing = async() => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    console.log(dataUrl);

    await axios.post('http://127.0.0.1:5000/predict', 
      {
      dataUrl
    }).then((response) => {
      console.log(response.data);
    }).catch((error) => {
      console.error('There was an error!', error);
    })



  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width="500"
        height="500"
        style={{ border: '1px solid white', backgroundColor: "blue" }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing} // Stop drawing if the user leaves the canvas area
      />
      <button onClick={submitDrawing}>Submit Drawing</button>
    </div>
  );
};

export default Canvas;
