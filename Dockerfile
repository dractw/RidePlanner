FROM node:stretch-slim

WORKDIR /opt/app

COPY . /opt/app
RUN npm install --production

CMD ["npm", "start"]
