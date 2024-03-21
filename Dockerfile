# Use an official Node runtime as a parent image
FROM node:18 as build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files from the current directory to the container
COPY . .

# Build the app
RUN npm run build

# Use Nginx as the server to serve the app
FROM nginx:1-alpine-slim

# Copy the build output from the build stage to the nginx directory
COPY --from=build /app/dist /usr/share/nginx/html

# Start Nginx (this is the command that will be executed when the container starts)
CMD ["nginx", "-g", "daemon off;"]
