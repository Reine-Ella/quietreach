FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p /app/data

ENV PORT=10000
ENV SESSION_SECRET=quietreach-secret-key
ENV DB_DIR=/app/data
ENV DB_PATH=/app/data/quietreach.db

EXPOSE 10000

CMD ["npm", "start"]
