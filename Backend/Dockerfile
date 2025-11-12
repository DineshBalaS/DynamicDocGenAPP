# 1. Base Image: Start from an official, lightweight Python image.
FROM python:3.11-slim

# 2. Set Environment Variables:
#    - PYTHONUNBUFFERED: Ensures that Python output (like print statements) is sent straight to the terminal without being buffered, which is useful for logging.
#    - APP_HOME: Sets a home directory for our application inside the container.
ENV PYTHONUNBUFFERED 1
ENV APP_HOME /app

# 3. Create and set the working directory
WORKDIR $APP_HOME

# 4. Install Dependencies:
#    - Copy only the requirements file first.
#    - This leverages Docker's layer caching. If you don't change your requirements, Docker won't re-install them every time you build, making builds much faster.
COPY Requirements.txt .
RUN pip install --no-cache-dir -r Requirements.txt

# 5. Copy Application Code:
#    - Copy the rest of your application's code into the container.
COPY . .

# 6. Expose the Port:
#    - Inform Docker that the container listens on port 8000.
#    - We will use Gunicorn to run the app on this port.
EXPOSE 8000

# 7. Run the Application:
#    - Use Gunicorn, a production-ready WSGI server, to run the app.
#    - 'main:app' tells Gunicorn to look in the 'main.py' file for a Flask app instance named 'app'.
#    - We bind it to 0.0.0.0 so it can accept connections from outside the container.
CMD ["sh", "-c", "python app/database/db_setup.py && gunicorn --bind 0.0.0.0:8000 main:app"]