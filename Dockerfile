FROM node:latest

WORKDIR /usr/src/app

RUN apt-get update && \
  apt-get install -y ffmpeg && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

COPY . .

# Build front-end
WORKDIR /usr/src/app/client/front-end

RUN yarn
RUN yarn build

# Build api
WORKDIR /usr/src/app

RUN yarn
RUN yarn build


EXPOSE 10000

CMD ["yarn", "start"]