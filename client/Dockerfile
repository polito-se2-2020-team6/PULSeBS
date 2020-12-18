# FROM node:latest

# RUN mkdir -p /usr/src/app
# WORKDIR /usr/src/app

# COPY . /usr/src/app/

# RUN npm install

# # ADD src /usr/src/app/src
# # ADD public /usr/src/app/public
# RUN npm build

# CMD ["npm","start"]


FROM node:12.18.3
# ENV NPM_CONFIG_LOGLEVEL warn
# ARG app_env
# ENV APP_ENV $app_env
RUN mkdir -p /src 
WORKDIR /src
COPY . /src
RUN npm install --production
CMD ["npm","start"]
