export const getPrompts = async () => {
     const response = await fetch('/api/gemini');
     const data = await response.json();
     return data.prompts;
   };
   
   export const submitDrawing = async (drawing) => {
     const formData = new FormData();
     formData.append('drawing', drawing);
   
     const response = await fetch('http://localhost:5000/predict', {
       method: 'POST',
       body: formData,
     });
     const data = await response.json();
     return data;
   };
   