FROM node:16.18.0
WORKDIR /server.js

COPY package.json .

RUN npm install

COPY . .

EXPOSE 4400

CMD ["npm", "start"]