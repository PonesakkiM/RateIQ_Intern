# Python base image
FROM python:3.10-slim

# Prevent Python from writing .pyc files and buffer output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Copy frontend requirements
COPY frontend/requirements.txt /app/requirements.txt

# Install python dependencies
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy frontend code and logo asset
COPY frontend/app.py /app/app.py
COPY public/logo.ico /app/logo.ico

# Expose port 8501 for Streamlit
EXPOSE 8501

# Run Streamlit app on port 8501
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
