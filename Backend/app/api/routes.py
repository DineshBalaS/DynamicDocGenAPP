# import os
# import psycopg2
# from flask import jsonify
# from . import api_bp

# def get_db_connection():
#     """Establishes a connection to the database."""
#     db_url = os.environ.get('DATABASE_URL')
#     if not db_url:
#         raise ValueError("DATABASE_URL environment variable is not set.")
#     return psycopg2.connect(db_url)

# @api_bp.route('/templates', methods=['GET'])
# def get_templates():
#     """
#     Endpoint to retrieve a list of all templates.
#     """
#     conn = None
#     try:
#         conn = get_db_connection()
#         cur = conn.cursor()
        
#         # Fetch essential data for the dashboard list
#         cur.execute("SELECT id, name, created_at FROM templates ORDER BY created_at DESC;")
        
#         # Fetch column names from the cursor description
#         columns = [desc[0] for desc in cur.description]
        
#         # Create a list of dictionaries from the results
#         templates = [dict(zip(columns, row)) for row in cur.fetchall()]
        
#         cur.close()
#         return jsonify(templates), 200

#     except (psycopg2.DatabaseError, ValueError) as e:
#         # Log the error in a real application
#         print(e) 
#         return jsonify({"error": "A database error occurred."}), 500
        
#     finally:
#         if conn:
#             conn.close()

import psycopg2
from flask import jsonify
from . import api_bp
from app import get_db # Import the new get_db function

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