import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

class Config:
    """Base configuration settings."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-hard-to-guess-string'
    
    # Database Configuration
    DATABASE_URL = os.environ.get('DATABASE_URL')
    
    #Frontend URL Configuration
    FRONTEND_URL = os.environ.get('FRONTEND_URL') or 'http://localhost:3000'
    
    # AWS S3 Configuration
    S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    AWS_REGION = os.environ.get('AWS_REGION') or 'us-east-1' # Default region