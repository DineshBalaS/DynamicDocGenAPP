import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

class Config:
    """Base configuration settings."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-hard-to-guess-string'
    
    # Database Configuration
    DATABASE_URL = os.environ.get('DATABASE_URL')
    
    # CORS Configuration: Reads a comma-separated string from the environment 
    # and splits it into a list, allowing multiple origins.
    CORS_ORIGINS_STR = os.environ.get('CORS_ORIGINS') or 'http://localhost:5173'
    CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_STR.split(',')]
    
    #Frontend URL Configuration
    FRONTEND_URL = os.environ.get('FRONTEND_URL') or 'http://localhost:3000'
    
    # AWS S3 Configuration
    S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    AWS_REGION = os.environ.get('AWS_REGION') or 'us-east-1' # Default region
    
    # image api
    # Pexels API Configuration
    PEXELS_API_KEY = os.environ.get('PEXELS_API_KEY')