FROM node:16.18.0
RUN mkdir -p /app

COPY . .

WORKDIR /app

# COPY package.json .



RUN npm install

EXPOSE 4400

CMD ["npm", "start"]