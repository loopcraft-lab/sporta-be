FROM node:21-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install ALL dependencies (including devDependencies for build)
# Use BuildKit cache mount for the pnpm store to speed up repeated builds.
# This requires BuildKit to be enabled (DOCKER_BUILDKIT=1).
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
	pnpm install --frozen-lockfile --store=/root/.pnpm-store

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

# Build the application
RUN pnpm build

# Verify dist folder exists
RUN ls -la /app/dist

EXPOSE 4000

ENV NODE_ENV=production

CMD ["pnpm", "start:prod"]
