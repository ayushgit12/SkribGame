'use client';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';

// export default function Home() {
//   const [roomId, setRoomId] = useState('');
//   const router = useRouter();

//   const createRoom = async () => {
//     const newRoomId = Math.random().toString(36).substring(2, 9);
//     const res = await fetch('http://127.0.0.1:5000/create-room', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ roomId: newRoomId })
//     });

//     if (res.ok) {
//       router.push(`/room/${newRoomId}`);
//     }
//   };

//   const joinRoom = async () => {
//     const res = await fetch('http://127.0.0.1:5000/join-room', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ roomId })
//     });

//     if (res.ok) {
//       router.push(`/room/${roomId}`);
//     } else {
//       alert('Room does not exist');
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <h1 className='font-bold' style={styles.title}>🎨 Drawing Game 🎨</h1>
//       <div style={styles.card}>
//         <h2 style={styles.subtitle}>Create or Join a Room</h2>
//         <div style={styles.buttonContainer}>
//           <button style={styles.button} onClick={createRoom}>
//             Create Room
//           </button>
//           <input
//             style={styles.input}
//             value={roomId}
//             onChange={(e) => setRoomId(e.target.value)}
//             placeholder="Enter Room ID"
//           />
//           <button style={styles.button} onClick={joinRoom}>
//             Join Room
//           </button>
//         </div>
//       </div>
//       <footer style={styles.footer}>
//         <p style={styles.footerText}>Made with ❤️ by Your Name</p>
//       </footer>
//     </div>
//   );
// }

// // Styles
// const styles = {
//   container: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//     minHeight: '100vh',
//     backgroundColor: '#3D9970', // Olive green background
//     color: '#ffffff', // White text for contrast
//     fontFamily: 'Arial, sans-serif',
//   },
//   title: {
//     fontSize: '3rem',
//     marginBottom: '20px',
//     color: '#FFDC00', // Bright yellow for the title
//     textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
//   },
//   card: {
//     backgroundColor: '#A2D5AB', // Light olive green for card background
//     padding: '20px',
//     borderRadius: '10px',
//     boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: '2rem',
//     marginBottom: '20px',
//     color: '#FFDC00', // Bright yellow for subtitle
//     textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
//   },
//   buttonContainer: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//   },
//   button: {
//     backgroundColor: '#FFDC00', // Bright yellow button color
//     color: 'black',
//     padding: '15px 32px',
//     margin: '10px 0',
//     border: 'none',
//     borderRadius: '5px',
//     fontSize: '1.2rem',
//     cursor: 'pointer',
//     transition: 'background-color 0.3s',
//     boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
//   },
//   buttonHover: {
//     backgroundColor: '#FFC107', // Darker yellow on hover
//   },
//   input: {
//     padding: '10px',
//     border: '1px solid #ccc',
//     borderRadius: '5px',
//     fontSize: '1rem',
//     margin: '10px 0',
//     width: '300px',
//     backgroundColor: 'white', // Light olive green input background
//     color: 'black', // White text in input
//     outline: 'none',
//   },
//   footer: {
//     marginTop: '20px',
//     fontSize: '0.8rem',
//     color: '#aaa', // Gray text for footer
//   },
//   footerText: {
//     textAlign: 'center',
//   },
// };

import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchImageData = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/generate");
      setImage(response.data.image_url); // Update with image URL from Flask
      setDescription(response.data.description); // Update with image description
    } catch (error) {
      console.error("Error fetching image data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImageData(); // Fetch image when component mounts
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Random Image from Unsplash</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {image && (
            <img
              src={image}
              alt="Random from Unsplash"
              style={{ width: "400px", height: "auto" }}
            />
          )}
          {description && <p>{description}</p>}
        </>
      )}
      <button
        onClick={fetchImageData}
        style={{ padding: "10px 20px", marginTop: "20px" }}
      >
        Generate New Image
      </button>
    </div>
  );
}