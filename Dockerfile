# Setup Backend & Serve
FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --verbose

# Copy server code (source)
COPY server ./server

# Copy Prisma files
COPY prisma ./prisma
COPY prisma.config.ts ./

# Copy TypeScript config files
COPY tsconfig.json ./
COPY tsconfig.server.json ./

# Set DATABASE_URL environment variable for Prisma
ENV DATABASE_URL="file:./dev.db"

# Generate Prisma Client for Linux
RUN npx prisma generate

# Build TypeScript files for backend
RUN npx tsc --project tsconfig.server.json --outDir server/dist

# Copy frontend build files
COPY dist ./dist
COPY public ./public

# Create uploads directory if not exists
RUN mkdir -p server/uploads

# Debug: Check if dist directory exists and list files
RUN ls -la /app/dist
RUN ls -la /app/dist/assets || true
RUN ls -la /app/server/dist || true

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server/dist/index.js"]
