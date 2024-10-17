from flask import Flask, jsonify
import requests
from flask_cors import CORS
import google.generativeai as genai
from io import BytesIO
from PIL import Image

app = Flask(__name__)
CORS(app)

UNSPLASH_API_URL = "https://api.unsplash.com/photos/random"
UNSPLASH_ACCESS_KEY = "QrRzWKC7-xoWuy0LxZU28fcrOhCAQMXUaHfUFq-axF0"  # Your Unsplash Access Key

# Configure the Google Gemini API
genai.configure(api_key="AIzaSyC5O6_6RfmR5WdNQieIx_wViPn1kmP74Uo")

def get_random_image():
    """Fetch a random image from Unsplash"""
    response = requests.get(UNSPLASH_API_URL, params={'client_id': UNSPLASH_ACCESS_KEY})
    if response.status_code == 200:
        image_data = response.json()
        return {
            "image_url": image_data.get('urls').get('regular'),
            "description": image_data.get('description') or "No description available"
        }
    return None

def process_image_with_gemini(image_url):
    """Download image and process with Gemini API"""
    # Step 1: Download the image
    image_response = requests.get(image_url)
    if image_response.status_code == 200:
        # Step 2: Save the image in memory and pass it to Gemini
        image = Image.open(BytesIO(image_response.content))
        image.save("temp_image.jpg")

        # Step 3: Upload the image to Gemini
        uploaded_file = genai.upload_file("temp_image.jpg", mime_type="image/jpeg")

        # Step 4: Generate text content from the image using Gemini
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "temperature": 0.9,
                "top_p": 0.95,
                "top_k": 32,
                "max_output_tokens": 1024,
                "response_mime_type": "text/plain"
            }
        )

        response = model.generate_content([uploaded_file, "Describe the image"])
        return response.text
    else:
        return "Error processing image"

# API route to send the image data to the frontend
@app.route('/generate', methods=['POST'])
def generate_image():
    # Fetch a random image from Unsplash
    image_info = get_random_image()
    if not image_info:
        return jsonify({"error": "Unable to fetch image"}), 500

    # Use Gemini to generate text from the image
    description = process_image_with_gemini(image_info["image_url"])
    
    # Return the image URL and description to the frontend
    return jsonify({"image_url": image_info["image_url"], "description": description})

if __name__ == "__main__":
    app.run(debug=True)