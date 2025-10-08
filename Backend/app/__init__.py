# from flask import Flask
# from flask_cors import CORS
# from config import Config

# def create_app(config_class=Config):
#     """
#     Creates and configures a Flask application instance.
#     """
#     app = Flask(__name__)
#     app.config.from_object(config_class)
    
#     #secure cors
#     frontend_url = app.config.get('FRONTEND_URL')
#     if frontend_url:
#         CORS(app, resources={r"/api/*": {"origins": frontend_url}})

#     # --- Register Blueprints ---
#     # Import the blueprint object first
#     from .api import api_bp
#     # Now import the routes module, which will register routes on the blueprint
#     from .api import routes
    
#     # Register the completed blueprint with the app
#     app.register_blueprint(api_bp, url_prefix='/api')

#     @app.route('/health')
#     def health_check():
#         return "OK", 200

#     return app

import os
import psycopg2
from flask import Flask, g
from flask_cors import CORS
from config import Config

def get_db():
    """
    Opens a new database connection if there is none yet for the
    current application context.
    """
    if 'db' not in g:
        db_url = os.environ.get('DATABASE_URL')
        if not db_url:
            raise ValueError("DATABASE_URL environment variable is not set.")
        g.db = psycopg2.connect(db_url)
    return g.db

def close_db(e=None):
    """
    Closes the database connection if it was opened. This function
    is automatically called by Flask after each request.
    """
    db = g.pop('db', None)
    if db is not None:
        db.close()

def create_app(config_class=Config):
    """
    Creates and configures a Flask application instance.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Register the close_db function to be called on app teardown
    app.teardown_appcontext(close_db)
    
    frontend_url = app.config.get('FRONTEND_URL')
    if frontend_url:
        CORS(app, resources={r"/api/*": {"origins": frontend_url}})

    # --- Register Blueprints ---
    from .api import api_bp
    from .api import routes
    app.register_blueprint(api_bp, url_prefix='/api')

    @app.route('/health')
    def health_check():
        return "OK", 200

    return app