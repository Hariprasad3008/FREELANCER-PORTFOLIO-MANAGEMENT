# Multi-stage Dockerfile for Freelancer Marketplace Full-Stack Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and package manifests
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm run install:all

# Copy source files
COPY . .

# Build client React application
RUN npm run build --prefix client

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy root manifests
COPY package*.json ./
COPY server/package*.json ./server/

# Install only production dependencies in server
RUN npm install --prefix server --omit=dev

# Copy server code
COPY server/ ./server/

# Copy compiled frontend from builder
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 5000

CMD ["node", "server/server.js"]
