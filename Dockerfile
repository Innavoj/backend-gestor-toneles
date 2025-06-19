FROM node:alpine3.20

WORKDIR /src

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD [ "npm", "start" ]
