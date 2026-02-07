# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace packages
COPY packages ./packages
COPY apps/api ./apps/api

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Generate Prisma Client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build the application
WORKDIR /app
RUN npm run build -- --filter=@vertexhub/api

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/api/package*.json ./apps/api/

RUN npm install --omit=dev

# Copy Prisma schema and migrations
COPY apps/api/prisma ./apps/api/prisma

# Generate Prisma Client in production
WORKDIR /app/apps/api
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/src/generated ./src/generated

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Start the application
CMD ["node", "dist/main.js"]
