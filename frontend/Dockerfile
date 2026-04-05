# Frontend Dockerfile - builds React app and serves using nginx

# build stage
FROM node:20-alpine AS build
WORKDIR /app

# copy package.json etc
COPY package*.json ./
RUN npm install

COPY . .
# ensure legacy provider option if needed
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build

# production stage
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html

# copy custom nginx config if needed
# ADD nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
