from flask import jsonify, request
import psycopg2
from flask_bcrypt import Bcrypt
import os

bcrypt = Bcrypt()
DATABASE_URL = os.getenv('POSTGRESQLID')

# Database connection
def get_db_connection():
    
    
    conn = psycopg2.connect(DATABASE_URL)
    return conn

def signup(data):
    full_name = data['fullName']
    email = data['emailid']
    password = data['password']
    username = data['username']
    
    # Hash the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if the user already exists
        cursor.execute('SELECT * FROM users WHERE emailid = %s OR username = %s', (email, username))
        existing_user = cursor.fetchone()

        if existing_user:
            cursor.close()
            conn.close()
            return jsonify({"error": "User with this email or username already exists!"}), 400

        # Insert the new user into the database
        cursor.execute(
            'INSERT INTO users (fullName, emailid, password, username) VALUES (%s, %s, %s, %s)',
            (full_name, email, hashed_password, username)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

def login():
    data = request.get_json()
    email = data['emailid']
    password = data['password']
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE emailid = %s', (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if user and bcrypt.check_password_hash(user[3], password):  # user[3] is the password field
            return jsonify({"message": "Login successful!", "username": user[4], "points": user[5], "fullName": user[1]}), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
def get_all_users():
    try:
        # Connect to the PostgreSQL database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # SQL query to select all users
        select_query = "SELECT id, fullName, emailid, username, points FROM users;"
        
        cursor.execute(select_query)
        users = cursor.fetchall()  # Fetch all rows from the query
        
        # Process and return the users as a list of dictionaries
        user_list = []
        for user in users:
            user_data = {
                "id": user[0],
                "fullName": user[1],
                "emailid": user[2],
                "username": user[3],
                "points": user[4]
            }
            user_list.append(user_data)
        
        # Close the cursor and connection
        cursor.close()
        conn.close()
        
        return user_list
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
def delete_user(identifier):
    try:
        # Connect to the PostgreSQL database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # First check if the identifier is an integer (for id) or a string (for username)
        if identifier.isdigit():  # Check if the identifier is a numeric string (e.g., id)
            id_value = int(identifier)
            cursor.execute("SELECT * FROM users WHERE id = %s", (id_value,))
        else:  # Treat identifier as username
            cursor.execute("SELECT * FROM users WHERE username = %s", (identifier,))
        
        user = cursor.fetchone()

        if user is None:
            return jsonify({"message": "User not found"}), 404

        # Now delete the user based on the identifier type
        if identifier.isdigit():
            cursor.execute("DELETE FROM users WHERE id = %s", (id_value,))
        else:
            cursor.execute("DELETE FROM users WHERE username = %s", (identifier,))

        conn.commit()  # Commit the changes to the database
        cursor.close()  # Close the cursor
        conn.close()  # Close the connection

        return jsonify({"message": "User deleted successfully"}), 200

    except Exception as e:
        print("Error during deletion:", str(e))
        return jsonify({"error": str(e)}), 500
    
def find_user(identifier):
    try:
        # Connect to the PostgreSQL database
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # First check if the identifier is an integer (for id) or a string (for username)
        if identifier.isdigit():  # Check if the identifier is a numeric string (e.g., id)
            id_value = int(identifier)
            cursor.execute("SELECT * FROM users WHERE id = %s", (id_value,))
        else:  # Treat identifier as username
            cursor.execute("SELECT * FROM users WHERE username = %s", (identifier,))
        
        user = cursor.fetchone()

        if user is None:
            return jsonify({"message": "User not found"}), 404

        user_data = {
            "id": user[0],
            "fullName": user[1],
            "emailid": user[2],
            "username": user[3],
            "points": user[4]
        }

        cursor.close()  # Close the cursor
        conn.close()  # Close the connection

        return user_data
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    


def predict(image_base64):
    try:
        prediction = predict(image_base64) #Contains 2 images ( system generated & user drawn )

        return jsonify({"prediction": prediction}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    

            

        