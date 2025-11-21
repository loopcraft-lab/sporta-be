# Build stage
FROM node:21-alpine AS builder

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

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY emails ./emails
COPY src ./src
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./

# Build the application with limited memory to prevent OOM
RUN NODE_OPTIONS="--max-old-space-size=512" pnpm build

# Production stage
FROM node:21-alpine

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

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/emails ./emails

# Verify dist folder exists
RUN ls -la /app/dist

EXPOSE 4000

ENV NODE_ENV=production

CMD ["pnpm", "start:prod"]
