# Python base image
FROM python:3.10-slim

# Prevent Python from writing .pyc files and buffer output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory to /app
WORKDIR /app

# Install system dependencies (such as libgomp1 for LightGBM support)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt to container
COPY requirements.txt /app/backend/requirements.txt

# Install python dependencies
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend code into /app/backend
COPY . /app/backend/

# Create models folder inside backend
RUN mkdir -p /app/backend/models

# Expose port
EXPOSE 8000

# Run uvicorn server from /app working directory, dynamically using the PORT environment variable if set
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
