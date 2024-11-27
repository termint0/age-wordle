# syntax=docker/dockerfile:1
FROM python:3.13.0-bookworm
WORKDIR /usr/local/agedle/

# Install the python3 dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir --break-system-packages -r requirements.txt

# Copy in the source code
COPY src/*.py ./
COPY resources ./resources

ENV PORT=8000

EXPOSE $PORT 

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--log-level", "info", "--preload", "--workers", "4", "app:app"]
