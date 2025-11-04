FROM python:3.10

# Set the working directory inside the container
WORKDIR /app

# Copy requirements and install them
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT 8080
EXPOSE 8080

# Command to run your app
CMD exec gunicorn --bind 0.0.0.0:$PORT --workers 1 --worker-class uvicorn.workers.UvicornWorker --timeout 0 main:app
