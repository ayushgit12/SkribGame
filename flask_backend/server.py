from flask import Flask, request, jsonify
from flask_socketio import SocketIO, join_room, leave_room, emit
from flask_cors import CORS  # Import CORS
import eventlet
import time
import threading
import google.generativeai as genai
import torch
import torchvision.models as models
import base64
from PIL import Image
import io
import requests
from io import BytesIO

# Initialize Flask and SocketIO
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

# Rooms dictionary for managing active rooms
rooms = {}

# Unsplash API setup
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
    image_response = requests.get(image_url)
    if image_response.status_code == 200:
        image = Image.open(BytesIO(image_response.content))
        buffered = BytesIO()
        image.save(buffered, format="JPEG")
        base64_image = base64.b64encode(buffered.getvalue()).decode("utf-8")
        print(base64_image)
        
        description = "Generated image description from Gemini."
        
        return {"base64_image": base64_image, "description": description}
    else:
        return {"error": "Error processing image"}

# API route to generate and return a random image and description
@app.route('/generate', methods=['POST'])
def generate_image():
    image_info = get_random_image()
    if not image_info:
        return jsonify({"error": "Unable to fetch image"}), 500

    image_data = process_image_with_gemini(image_info["image_url"])
    
    return jsonify({
        "image_base64": image_data["base64_image"], 
        "description": image_data["description"]
    })

# Room management routes
@app.route('/create-room', methods=['POST'])
def create_room():
    room_id = request.json.get("roomId")
    if room_id in rooms:
        return jsonify({"error": "Room already exists"}), 400
    rooms[room_id] = {"users": []}
    return jsonify({"message": "Room created"}), 200

@app.route('/join-room', methods=['POST'])
def join_room_endpoint():
    room_id = request.json.get("roomId")
    if room_id not in rooms:
        return jsonify({"error": "Room does not exist"}), 404
    return jsonify({"message": "Room joined"}), 200

# Predict route for image similarity
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    m = timm.create_model('vit_small_patch14_dinov2.lvd142m', pretrained=True)
    m.eval()
    
    t = timm.data.create_transform(
        input_size=224,
        is_training=False,
        mean=(0.485, 0.456, 0.406),
        std=(0.229, 0.224, 0.225)
    )
    
    embs = []
    for img_b64 in data:
        img_data = base64.b64decode(img_b64)
        img = Image.open(io.BytesIO(img_data)).convert('RGB')
        img_t = t(img).unsqueeze(0)
        with torch.no_grad():
            emb = m(img_t)
        embs.append(emb)
    
    cos = torch.nn.CosineSimilarity(dim=1, eps=1e-6)
    return cos(embs[0], embs[1]).item()

# SocketIO event handling
@socketio.on('join')
def handle_join(data):
    room_id = data.get('roomId')
    username = data.get('username')
    
    if room_id in rooms:
        join_room(room_id)
        rooms[room_id]['users'].append(username)
        
        is_host = len(rooms[room_id]['users']) == 1

        emit('user_list', rooms[room_id]['users'], room=room_id)
        emit('message', f"{username} has joined the room", room=room_id)
        emit('host_info', {'isHost': is_host}, room=request.sid)
    else:
        emit('error', {'error': 'Room does not exist'})

@socketio.on('leave')
def handle_leave(data):
    room_id = data.get('roomId')
    username = data.get('username')

    if room_id in rooms:
        leave_room(room_id)
        rooms[room_id]['users'].remove(username)
        emit('user_list', rooms[room_id]['users'], room=room_id)
        emit('message', f"{username} has left the room", room=room_id)

# Game timer
def timer_thread(room_id, duration):
    while duration > 0:
        time.sleep(1)
        duration -= 1
        socketio.emit('timerUpdate', duration, room=room_id)
    
    socketio.emit('timeUp', room=room_id)

@socketio.on('start_game')
def start_game(data):
    room_id = data.get('roomId')
    emit('game_started', {'timer': 120}, room=room_id)

    threading.Thread(target=timer_thread, args=(room_id, 120)).start()

@socketio.on('drawing')
def handle_drawing(data):
    room_id = data.get('roomId')
    username = data.get('username')

@socketio.on('chat_message')
def handle_chat_message(data):
    room_id = data.get('roomId')
    message = data.get('message')
    emit('chat_message', message, room=room_id)

if __name__ == '__main__':
    socketio.run(app, debug=True)
