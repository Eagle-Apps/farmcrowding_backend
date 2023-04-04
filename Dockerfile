FROM node:16.18.0
# FROM node:16-alpine
RUN npm install -g nodemon

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 4400

# CMD ["node", "server.js"]
# CMD ["npm", "run", "start"]
CMD ["npm", "run", "dev"]