## Specifies the base image we're extending
FROM node:alpine

## Create base directory
RUN mkdir /src
RUN mkdir /src/uploads

## Specify the "working directory" for the rest of the Dockerfile
WORKDIR /src

## Install packages using NPM 5 (bundled with the node:9 image)
COPY ./package.json /src/package.json
COPY ./package-lock.json /src/package-lock.json
RUN npm install --silent

## Add application code
COPY ./db /src/db
COPY ./giphy /src/giphy
COPY ./public /src/public
COPY ./routes /src/routes
COPY ./status-codes /src/status-codes
COPY ./views /src/views
COPY ./app.js /src/app.js

## Set environment to "development" by default
ENV NODE_ENV development

## Allows port 3000 to be publicly available
EXPOSE 3000

## The command uses nodemon to run the application
CMD ["node", "app.js"]