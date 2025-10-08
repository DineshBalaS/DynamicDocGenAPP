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