import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def create_tables():
    """Create the templates table in the PostgreSQL database."""
    conn = None
    try:
        # Get the database URL from the environment
        db_url = os.environ.get('DATABASE_URL')
        if not db_url:
            raise ValueError("DATABASE_URL environment variable is not set.")
            
        # Connect to the database
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # SQL command to create the 'templates' table
        # We use JSONB for the placeholders, which is efficient for storing JSON
        create_table_command = """
        CREATE TABLE IF NOT EXISTS templates (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            s3_key VARCHAR(1024) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            placeholders JSONB
        );
        """
        
        add_column_command = """
        ALTER TABLE templates ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        """
        
        cur.execute(create_table_command)
        cur.execute(add_column_command)
        
        # Commit the changes
        conn.commit()
        print("Table 'templates' created successfully or already exists.")
        
        # Close communication with the database
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()

if __name__ == '__main__':
    create_tables()