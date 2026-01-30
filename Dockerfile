# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Remove server directory to keep frontend build clean
RUN rm -rf server
RUN npm run build

# Stage 2: Setup Backend & Serve
FROM node:20-alpine
WORKDIR /app

# Install production dependencies for server
COPY package*.json ./
# We need prisma client in production
RUN npm install --omit=dev && npm install prisma

# Copy server code (including pre-built JavaScript files)
COPY server ./server
COPY prisma ./prisma

# Copy built frontend
COPY --from=frontend-builder /app/dist ./public

# Generate Prisma Client
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p server/uploads

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "run", "server"]
