import os
from app import create_app

# Create an application instance
app = create_app()

if __name__ == '__main__':
    # Use the PORT environment variable if available, otherwise default to 5000
    port = int(os.environ.get('PORT', 5000))
    # Run the app
    app.run(host='0.0.0.0', port=port, debug=True)