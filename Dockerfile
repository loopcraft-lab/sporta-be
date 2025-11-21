# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install ALL dependencies (including devDependencies for build)
# Skip prepare script (husky) in Docker
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
	pnpm install --frozen-lockfile --ignore-scripts --store=/root/.pnpm-store

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma client (use pnpm to respect package.json version)
RUN pnpm prisma generate

# Copy source code
COPY emails ./emails
COPY src ./src
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./

# Build the application with increased memory allocation
# GitHub Actions runners have 16GB RAM, so we can use more memory
RUN NODE_OPTIONS="--max-old-space-size=2048" pnpm build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install only production dependencies
# Skip prepare script (husky) in Docker
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
	pnpm install --frozen-lockfile --prod --ignore-scripts --store=/root/.pnpm-store

# Copy prisma schema
COPY prisma ./prisma

# Copy Prisma client generated in builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/emails ./emails

# Verify dist folder exists
RUN ls -la /app/dist

EXPOSE 4000

ENV NODE_ENV=production

CMD ["pnpm", "start:prod"]
