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

import json
import psycopg2
from psycopg2.extras import Json
from flask import jsonify, request
from . import api_bp
from app import get_db, get_s3
from app.services import pptx_service
from app.services.s3_service import S3Service, S3UploadError, S3Error

@api_bp.route('/templates', methods=['GET'])
def get_templates():
    """
    Endpoint to retrieve a list of all templates.
    """
    try:
        db = get_db()
        cur = db.cursor()
        
        cur.execute("SELECT id, name, created_at FROM templates WHERE deleted_at IS NULL ORDER BY created_at DESC;")
        
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
    
@api_bp.route('/save_template', methods=['POST'])
def save_template():
    """
    Endpoint to save a new template. Uploads the file to S3 and saves
    its metadata to the database.
    """
    # 1. Validation
    if 'file' not in request.files or 'templateName' not in request.form or 'placeholders' not in request.form:
        return jsonify({"error": "Missing file, templateName, or placeholders in the request"}), 400

    file = request.files['file']
    template_name = request.form['templateName']
    placeholders_str = request.form['placeholders']

    if not template_name.strip():
        return jsonify({"error": "Template name cannot be empty"}), 400

    if not file.filename.endswith('.pptx'):
        return jsonify({"error": "Invalid file type. Please upload a .pptx file."}), 400

    db = get_db()
    try:
        with db.cursor() as cur:
            # 2. Business Logic: Check for duplicate name
            cur.execute("SELECT id FROM templates WHERE name = %s", (template_name,))
            if cur.fetchone():
                return jsonify({"error": "A template with this name already exists."}), 409

            # 3. Business Logic: Upload to S3
            s3 = get_s3()
            s3_key = s3.upload_file(file.stream, file.filename)

            # 4. Business Logic: Save to Database
            placeholders = json.loads(placeholders_str)
            
            insert_query = """
                INSERT INTO templates (name, s3_key, placeholders)
                VALUES (%s, %s, %s)
                RETURNING id, name, created_at, placeholders;
            """
            cur.execute(insert_query, (template_name, s3_key, Json(placeholders)))
            
            new_template_record = cur.fetchone()
            db.commit()

            # Format the response
            columns = [desc[0] for desc in cur.description]
            new_template = dict(zip(columns, new_template_record))

        # 5. Success Response
        return jsonify(new_template), 201

    except (S3UploadError, psycopg2.Error, json.JSONDecodeError) as e:
        # 6. Error Handling
        db.rollback()
        print(f"Error saving template: {e}")
        return jsonify({"error": "An internal error occurred while saving the template."}), 500

@api_bp.route('/templates/<int:template_id>', methods=['DELETE'])
def delete_template(template_id):
    """
    Endpoint to delete a template. Moves the S3 file to a trash folder
    and removes the record from the database.
    """
    db = get_db()
    try:
        with db.cursor() as cur:
            # Step 1: Fetch the record to get the s3_key
            cur.execute("SELECT s3_key FROM templates WHERE id = %s", (template_id,))
            record = cur.fetchone()

            # Step 2: Handle Not Found
            if record is None:
                return jsonify({"error": "Template not found."}), 404
            
            s3_key = record[0]

            # Step 3: Move S3 Object to Trash
            s3 = get_s3()
            s3.move_file_to_trash(s3_key)

            # Step 4: update the timestamp in the database
            cur.execute("UPDATE templates SET deleted_at = CURRENT_TIMESTAMP WHERE id = %s", (template_id,))
            
            # Step 5: Commit Transaction
            db.commit()

        # Success Response
        return jsonify({"message": "Template moved to trash. Files are permanently deleted after 30 days."}), 200

    except (S3Error, psycopg2.Error) as e:
        # Error Handling
        db.rollback()
        print(f"Error deleting template {template_id}: {e}")
        return jsonify({"error": "An internal error occurred while deleting the template."}), 500