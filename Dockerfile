FROM python:3.12
WORKDIR /usr/local/app

RUN apt-get update && apt-get install -y \
    software-properties-common \
    npm

RUN npm install npm@latest -g && \
    npm install n -g && \
    n latest

RUN npm install -g \
    typescript \
    google-closure-compiler

# Install the application dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy in the source code
COPY src ./src
COPY resources ./resources
COPY gunicorn_hooks.py ./gunicorn_hooks.py
COPY tsconfig.json ./tsconfig.json

RUN tsc && \
    mv ./src/static/lib/main.js ./src/static/lib/main_big.js && \
    google-closure-compiler --js ./src/static/lib/main_big.js --js_output_file ./src/static/lib/main.js



EXPOSE 80 


# Setup an app user so the container doesn't run as the root user
RUN useradd app
USER app

CMD ["gunicorn", "-c", "gunicorn_hooks.py"]
