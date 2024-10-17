export async function GET() {
     // Simulate an API call to the Gemini API
     const prompts = ["A sunny beach", "A mountain peak", "A running cat"];
     return new Response(JSON.stringify({ prompts }), {
       status: 200,
       headers: { 'Content-Type': 'application/json' },
     });
   }
   