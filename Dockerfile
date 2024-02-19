FROM node:18.9.1
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i
COPY . .
# EXPOSE 9000
# CMD ["node","express.js"]
#sudo docker build -t sguha1988/aws-node-dynamodb-api-project .