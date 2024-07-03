FROM node:20.11.1-alpine

WORKDIR /server

COPY package*.json ./

RUN npm ci

COPY src/ ./src/
COPY server.js ./

EXPOSE 3000

CMD ["npm", "start"]