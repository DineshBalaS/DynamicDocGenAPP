# import psycopg2
# from flask import jsonify
# from . import api_bp
# from app import get_db # Import the new get_db function

# @api_bp.route('/templates', methods=['GET'])
# def get_templates():
#     """
#     Endpoint to retrieve a list of all templates.
#     """
#     try:
#         db = get_db()
#         cur = db.cursor()
        
#         cur.execute("SELECT id, name, created_at FROM templates ORDER BY created_at DESC;")
        
#         columns = [desc[0] for desc in cur.description]
#         templates = [dict(zip(columns, row)) for row in cur.fetchall()]
        
#         cur.close()
#         return jsonify(templates), 200

#     except (psycopg2.DatabaseError, ValueError) as e:
#         print(e) 
#         return jsonify({"error": "A database error occurred."}), 500

import psycopg2
from flask import jsonify, request
from . import api_bp
from app import get_db
from app.services import pptx_service

@api_bp.route('/templates', methods=['GET'])
def get_templates():
    """
    Endpoint to retrieve a list of all templates.
    """
    try:
        db = get_db()
        cur = db.cursor()
        
        cur.execute("SELECT id, name, created_at FROM templates ORDER BY created_at DESC;")
        
        columns = [desc[0] for desc in cur.description]
        templates = [dict(zip(columns, row)) for row in cur.fetchall()]
        
        cur.close()
        return jsonify(templates), 200

    except (psycopg2.DatabaseError, ValueError) as e:
        print(e) 
        return jsonify({"error": "A database error occurred."}), 500

@api_bp.route('/upload', methods=['POST'])
def upload_file():
    """
    Endpoint to upload and analyze a .pptx file for placeholders.
    This does not save the template permanently.
    """
    # 1. Validation Checks
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if not file.filename.endswith('.pptx'):
        return jsonify({"error": "Invalid file type. Please upload a .pptx file."}), 400

    # 2. Service Integration and Error Handling
    try:
        # Pass the file stream directly to the service
        placeholders = pptx_service.extract_placeholders(file.stream)
        
        # 3. Success Response
        return jsonify(placeholders), 200

    except Exception as e:
        # Log the actual error for debugging
        print(f"Error processing file: {e}") 
        return jsonify({"error": "Failed to process the presentation file."}), 500