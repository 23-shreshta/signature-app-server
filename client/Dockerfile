# Stage 1: Build the React Application
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Set API URL to empty so requests go to the same host (Nginx will proxy them)
ENV REACT_APP_API_URL=''
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
# Copy the built React app to Nginx's web root
COPY --from=build /app/build /usr/share/nginx/html
# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
