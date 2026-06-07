# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first (better layer caching)
COPY package*.json ./

# Install ALL deps (including devDeps needed for build)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build NestJS app → produces /app/dist
RUN npm run build

# ─── Stage 2: Production Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only package files
COPY package*.json ./

# Install ONLY production deps
RUN npm ci --only=production && npm cache clean --force

# Copy built output from builder stage
COPY --from=builder /app/dist ./dist

# Create upload directory (required by main.ts)
RUN mkdir -p public/uploads

# Railway / Choreo injects PORT automatically
EXPOSE 3001

CMD ["node", "dist/main.js"]
