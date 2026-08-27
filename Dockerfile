# Multi-stage Production Dockerfile (Compatible with AWS, Railway, Render, Docker)

# Stage 1: Build React Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --prefer-offline --no-audit

COPY frontend/ ./
RUN npm run build

# Stage 2: Production Backend Server
FROM node:20-slim AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production --prefer-offline --no-audit

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend assets from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose standard container port
EXPOSE 4000

# Start full-stack server
CMD ["node", "backend/server.js"]
