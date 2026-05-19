# Stage 1: Build the React frontend
FROM node:22-slim AS frontend-builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Build the production backend
FROM node:22-slim
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/pootprint.db

# Copy backend package configuration and install only production dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

# Copy backend application source code
COPY backend/ ./

# Copy built frontend assets from Stage 1 into the location expected by server.js
COPY --from=frontend-builder /app/dist /app/dist

# Create a data directory for the persistent SQLite database volume
RUN mkdir -p /app/data

EXPOSE 3000

# Start server
CMD ["node", "server.js"]
