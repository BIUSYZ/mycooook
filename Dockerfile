# Setup Backend & Serve
FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy server code
COPY server ./server
COPY prisma ./prisma
COPY tsconfig.json ./
COPY tsconfig.server.json ./

# Copy frontend code
COPY src ./src
COPY public ./public
COPY index.html ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Generate Prisma Client
RUN npx prisma@6.19.2 generate

# Build TypeScript files for backend
RUN npx tsc --project tsconfig.server.json --outDir server/dist

# Build frontend
RUN npm run build

# Create uploads directory
RUN mkdir -p server/uploads

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server/dist/index.js"]
