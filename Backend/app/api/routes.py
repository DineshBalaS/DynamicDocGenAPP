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
import re
import psycopg2
from psycopg2.extras import Json
from flask import jsonify, request, send_file
from pptx_renderer.plugins import Image, table

from . import api_bp
from app import get_db, get_s3
from app.services import pptx_service
from app.services.s3_service import S3Service, S3UploadError, S3Error

def sanitize_filename(filename):
    """Removes characters that are unsafe for file systems."""
    return re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)

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
            cur.execute("SELECT id FROM templates WHERE name = %s AND deleted_at IS NULL", (template_name,))
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
            cur.execute("SELECT s3_key FROM templates WHERE id = %s AND deleted_at IS NULL", (template_id,))
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

# @api_bp.route('/generate', methods=['POST'])
# def generate():
#     """Endpoint to generate a presentation from a template and user data."""
#     payload = request.get_json()
#     if not payload or 'templateId' not in payload or 'data' not in payload:
#         return jsonify({"error": "Missing templateId or data in request body"}), 400
    
#     template_id = payload['templateId']
#     data = payload['data']
#     db = get_db()

#     try:
#         with db.cursor() as cur:
#             # 1. Fetch template and validate
#             query = "SELECT name, s3_key, placeholders FROM templates WHERE id = %s AND deleted_at IS NULL"
#             cur.execute(query, (template_id,))
#             record = cur.fetchone()
#             if record is None:
#                 return jsonify({"error": "Template not found."}), 404
            
#             template_name, s3_key, required_placeholders = record

#             # 2. Validate incoming data against required placeholders
#             for placeholder in required_placeholders:
#                 ph_name = placeholder['name']
#                 if ph_name not in data or not str(data[ph_name]).strip():
#                     return jsonify({"error": f"Missing or empty value for required placeholder: {ph_name}"}), 400

#             # 3. Download, Generate, and Respond
#             s3 = get_s3()
#             template_stream = s3.download_file_as_stream(s3_key)
            
#             output_stream = pptx_service.generate_presentation(template_stream, data)

#             # 4. Determine filename and send file
#             client_name = data.get('client_name', '').strip()
#             download_name = f"{client_name}.pptx" if client_name else f"{template_name}.pptx"
            
#             return send_file(
#                 output_stream,
#                 mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation',
#                 as_attachment=True,
#                 download_name=sanitize_filename(download_name)
#             )
#     except Exception as e:
#         print(f"Error generating presentation for template {template_id}: {e}")
#         return jsonify({"error": "An internal error occurred while generating the presentation."}), 500

@api_bp.route('/generate', methods=['POST'])
def generate():
    """
    Endpoint to generate a presentation from a template and user data.
    Orchestrates downloading the template and images from S3, preparing
    the rendering context, and calling the presentation generation service.
    """
    # 1. Extract and validate the request payload
    payload = request.get_json()
    if not payload or 'templateId' not in payload or 'data' not in payload:
        return jsonify({"error": "Missing templateId or data in request body"}), 400

    template_id = payload['templateId']
    data = payload['data']
    db = get_db()

    try:
        with db.cursor() as cur:
            # 2. Fetch template metadata from the database
            query = "SELECT name, s3_key, placeholders FROM templates WHERE id = %s AND deleted_at IS NULL"
            cur.execute(query, (template_id,))
            record = cur.fetchone()
            if record is None:
                return jsonify({"error": "Template not found."}), 404

            template_name, s3_key, required_placeholders = record

            # 3. Validate that the incoming data provides all required placeholders
            for placeholder in required_placeholders:
                ph_name = placeholder['name']
                if ph_name not in data or (data[ph_name] is None) or \
                   (isinstance(data[ph_name], str) and not data[ph_name].strip()):
                    return jsonify({"error": f"Missing or empty value for required placeholder: '{ph_name}'"}), 400

            # 4. Prepare for generation
            s3 = get_s3()
            template_stream = s3.download_file_as_stream(s3_key)
            
            # 5. Build the rendering context, processing special data types
            render_context = {}
            for placeholder in required_placeholders:
                ph_name = placeholder['name']
                ph_type = placeholder.get('type', 'text')
                value = data[ph_name]

                if ph_type == 'image':
                    # For images, the value is an S3 key. Download it into a
                    # stream and wrap it in the renderer's Image object.
                    image_stream = s3.download_file_as_stream(value)
                    render_context[ph_name] = Image(image_stream)
                elif ph_type == 'table':
                    # For tables, the value is a list of lists. Wrap it
                    # in the renderer's Table object.
                    render_context[ph_name] = table(value)
                elif isinstance(value, list):
                    # For bullet points, convert a list of strings into a
                    # single string with newline separators.
                    render_context[ph_name] = "\n".join(map(str, value))
                else:
                    # For plain text, use the value directly.
                    render_context[ph_name] = value
            
            # Also include any data keys that might not be in the formal
            # placeholders list, allowing for more flexible templates.
            for key, value in data.items():
                if key not in render_context:
                    render_context[key] = value

            # 6. Call the service to perform the generation
            output_stream = pptx_service.generate_presentation(template_stream, data, s3)

            # 7. Create a sensible download name and return the file
            client_name = data.get('client_name', '').strip()
            download_name = f"{client_name}.pptx" if client_name else f"{template_name}.pptx"
            
            return send_file(
                output_stream,
                mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation',
                as_attachment=True,
                download_name=sanitize_filename(download_name)
            )

    except S3Error as e:
        print(f"S3 Error generating presentation for template {template_id}: {e}")
        return jsonify({"error": "An error occurred with the file storage service."}), 500
    except psycopg2.Error as e:
        print(f"Database Error generating presentation for template {template_id}: {e}")
        return jsonify({"error": "An error occurred with the database."}), 500
    except Exception as e:
        # Catch-all for other errors, such as from the pptx-renderer library
        print(f"Unexpected error generating presentation for template {template_id}: {e}")
        return jsonify({"error": "An internal error occurred while generating the presentation."}), 500