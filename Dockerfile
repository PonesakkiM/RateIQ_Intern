# ==========================================
# Stage 1: Build the React & Express App
# ==========================================
FROM node:20-slim AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install ALL dependencies (including devDependencies like esbuild, typescript, etc.)
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the frontend assets and bundle the backend server.ts using the package script
RUN npm run build

# ==========================================
# Stage 2: Production Release Image
# ==========================================
FROM node:20-slim AS runner

WORKDIR /app

# Copy production package manifests
COPY package*.json ./

# Install only production dependencies to keep the image super light
RUN npm install --omit=dev

# Copy built application assets and code from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the correct dynamic port (Render will override this via the PORT environment variable)
EXPOSE 3000

# Start command for the Express server serving Vite assets
CMD ["npm", "run", "start"]
