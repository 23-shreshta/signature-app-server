FROM node:18-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy application code
COPY . .

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]
