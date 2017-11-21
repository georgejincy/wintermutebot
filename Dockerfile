FROM node:6.12.0-alpine

# create app directory 
RUN mkdir -p /usr/src/app 
WORKDIR /usr/src/app 

#install botkit
COPY package.json /usr/src/app/
RUN npm install --production
COPY index.js /usr/src/app/ 

#set startup commands
CMD ["node", "index"]
