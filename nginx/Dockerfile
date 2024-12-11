FROM nginx:1.27.3-bookworm 
WORKDIR /usr/local/agedle


RUN apt-get update && apt-get install -y \
    software-properties-common \
    npm

RUN npm install npm@latest -g && \
    npm install n -g && \
    n latest

RUN npm install -g \
    typescript \
    uglify-js

# Copy in the source code
COPY src ./src

# TypeScript
COPY tsconfig.json ./tsconfig.json
RUN /usr/local/bin/tsc && \
    mv ./src/static/lib/main.js ./src/static/lib/main_big.js

RUN uglifyjs -c -m --output ./src/static/lib/main.js -- ./src/static/lib/main_big.js 


COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 
CMD ["nginx", "-g", "daemon off;"]
